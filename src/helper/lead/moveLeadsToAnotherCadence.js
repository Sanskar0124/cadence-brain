// Utils
const logger = require('../../utils/winston');
const {
  CRM_INTEGRATIONS,
  SHEETS_CADENCE_INTEGRATION_TYPE,
  BULK_OPTIONS,
  CADENCE_STATUS,
  SETTING_TYPES,
  ACTIVITY_TYPE,
  CADENCE_LEAD_STATUS,
  LEAD_INTEGRATION_TYPES,
} = require('../../utils/enums');

const { DB_TABLES, DB_MODELS } = require('../../utils/modelEnums');

// Packages
const { Op, QueryTypes } = require('sequelize');

// Repositories
const Repository = require('../../repository');

// Helpers and Services
const AccessTokenHelper = require('../access-token');
const LeadToCadenceHelper = require('../lead-to-cadence');
const AutomatedTasksHelper = require('../automated-tasks');
const SalesforceService = require('../../services/Salesforce');
const CadenceHelper = require('../cadence');
const ActivityHelper = require('../activity');
const UserHelper = require('../user');
const TaskHelper = require('../task');

/**
 * Transfers leads from one or multiple cadences to another cadence.
 * If the target cadence is in progress, it also starts the cadence for the transferred leads.
 *
 * @param {Object} params - The parameters for the function.
 * @param {Array<number>} params.cadence_ids_to_stop - Cadence IDs from which leads need to be removed.
 * @param {Object} params.cadenceToStart - Target cadence details where the leads should be moved.
 * @param {string} params.option - Determines whether all or specific leads will be moved. Possible values are 'BULK_OPTIONS.ALL' or 'BULK_OPTIONS.SELECTED'.
 * @param {Object} params.user - Details of the user initiating the move.
 * @param {Array<Object>} params.leads - Leads to be moved. Each lead object should at least contain a 'lead_id'.
 * @param {Object} [params.t] - Transaction object if operations need to be atomic. Can be null or omitted if not using transactions.
 *
 */

const moveLeadsToAnotherCadence = async ({
  cadence_ids_to_stop = [],
  cadenceToStart,
  option,
  user,
  leads,
  t = null,
}) => {
  try {
    let gsLeadIds = []; // to store lead_ids of google sheet leads
    const lead_ids = leads
      .filter((l) => {
        if (l.integration_type !== LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD) {
          return true;
        }
        logger.info(`Lead id: ${l.lead_id} is a ${l.integration_type}`);
        gsLeadIds.push(l.lead_id);
        return false;
      })
      .map((l) => l.lead_id);
    const cadence_id_to_start = cadenceToStart.cadence_id;
    if (lead_ids.length === 0) {
      const infoMessage = `No leads to move for user ID: ${user.user_id}`;
      logger.info(infoMessage);
      return [
        {
          msg: infoMessage,
          gsLeadIds,
        },
        null,
      ];
    }
    if (cadence_ids_to_stop.length === 0) {
      const errorMessage = `'cadence_ids_to_stop' should not be empty`;
      logger.error(errorMessage);
      return [null, errorMessage];
    }

    if (user.integration_type === CRM_INTEGRATIONS.SHEETS) {
      if (
        cadenceToStart.integration_type ===
        SHEETS_CADENCE_INTEGRATION_TYPE.SHEETS
      ) {
        const errorMessage =
          'Move to another cadence is not supported for google sheets leads or cadence with google sheet leads';
        logger.error(errorMessage);
        return [null, errorMessage];
      } else {
        let [updateCadence, errForUpdatingCadence] = await Repository.update({
          tableName: DB_TABLES.CADENCE,
          query: { cadence_id: cadenceToStart.cadence_id },
          updateObject: {
            integration_type: SHEETS_CADENCE_INTEGRATION_TYPE.EXCEL,
          },
          t,
        });
        if (errForUpdatingCadence) {
          const errorMessage = `Error while updating cadence type: ${errForUpdatingCadence}`;
          logger.error(errorMessage);
          return [null, errorMessage];
        }
      }
    }
    // Fetching salesforce token and instance url
    let access_token, instance_url, errForAccessToken;
    if (user.integration_type === CRM_INTEGRATIONS.SALESFORCE) {
      [{ access_token, instance_url }, errForAccessToken] =
        await AccessTokenHelper.getAccessToken({
          integration_type: user.integration_type,
          user_id: user.user_id,
        });
      if (errForAccessToken) {
        const errorMessage = `Error while fetching salesforce access token: ${errForAccessToken}`;
        logger.error(errorMessage);
        return [null, errorMessage];
      }
    }
    const select_condition =
      option === BULK_OPTIONS.ALL
        ? `ltc.cadence_id IN (${cadence_ids_to_stop})`
        : `ltc.lead_id IN (${lead_ids?.join(
            ','
          )}) AND ltc.cadence_id IN (${cadence_ids_to_stop})`;
    const query = `INSERT IGNORE INTO lead_to_cadence (lead_cadence_id,lead_id, cadence_id, unsubscribed, status,created_at,updated_at,lead_cadence_order)
      WITH sub_table AS (
        SELECT lead_id, unsubscribed 
        FROM lead_to_cadence 
        WHERE unsubscribed = true AND lead_id IN (:lead_ids)
      ),
      updated_links AS (
        SELECT 
          ltc.lead_id,
          :start_cadence_id AS cadence_id,
          ltc.lead_cadence_order,
           UUID() AS lead_cadence_id,
          CASE
            WHEN sub_table.lead_id IS NULL
              THEN false
            ELSE true
          END AS unsubscribed,
          CASE
          WHEN stopped_leads.status IN ('trash','converted') 
            THEN 'stopped'
          ELSE 'not_started'
          END AS status
        FROM lead_to_cadence AS ltc JOIN \`lead\` AS stopped_leads ON ltc.lead_id = stopped_leads.lead_id
        LEFT JOIN sub_table ON sub_table.lead_id = ltc.lead_id
        WHERE ${select_condition}
      )
      SELECT lead_cadence_id,lead_id, cadence_id, unsubscribed, status,NOW() as create_at, NOW() as updated_at,lead_cadence_order
      FROM updated_links;
    `;
    const [tranferLeads, errTransfer] = await Repository.runRawQuery({
      rawQuery: query,
      tableName: DB_MODELS[DB_TABLES.LEADTOCADENCE],
      include: [
        {
          model: DB_MODELS[DB_TABLES.LEAD],
        },
      ],
      replacements: {
        stop_cadence_id: cadence_ids_to_stop,
        start_cadence_id: cadence_id_to_start,
        lead_ids: leads.map((lead) => lead.lead_id),
      },
      extras: {
        type: QueryTypes.INSERT,
        returning: true,
      },
      t,
    });
    if (errTransfer) {
      const errorMessage = `Error While Transfering leads: ${errTransfer}`;
      logger.error(errorMessage);
      return [null, errorMessage];
    }

    const deleteLeadToCadenceLinkQuery =
      option === BULK_OPTIONS.SELECTED
        ? {
            lead_id: {
              [Op.in]: lead_ids,
            },
            cadence_id: {
              [Op.in]: cadence_ids_to_stop,
            },
          }
        : {
            cadence_id: {
              [Op.in]: cadence_ids_to_stop,
            },
          };

    const [deleteLeadToCadenceLink, errForDeletingLeadToCadence] =
      await Repository.destroy({
        tableName: DB_TABLES.LEADTOCADENCE,
        query: deleteLeadToCadenceLinkQuery,
        t,
      });
    if (errForDeletingLeadToCadence) {
      const errorMessage = `Error while deleting lead to cadence link: ${errForDeletingLeadToCadence}`;
      logger.error(errorMessage);
      return [null, errorMessage];
    }

    if (cadenceToStart.status === CADENCE_STATUS.IN_PROGRESS) {
      const [firstNode, errForFirstNode] = await Repository.fetchOne({
        tableName: DB_TABLES.NODE,
        query: {
          cadence_id: cadence_id_to_start,
          is_first: 1,
        },
        t,
      });
      if (errForFirstNode) {
        const errorMessage = `Error while fetching first Node:${errForFirstNode}`;
        logger.error(errorMessage);
        return [null, errorMessage];
      }
      let startTimeMap = {};
      let automatedMailSettingsMap = {};

      for (let lead of leads) {
        let user_id = lead.user_id;
        let timezone = lead.User?.timezone;

        let automatedMailSettings,
          errForAutomatedMailSettings = null;

        automatedMailSettings = automatedMailSettingsMap[user_id];
        if (user_id && !automatedMailSettings) {
          [automatedMailSettings, errForAutomatedMailSettings] =
            await UserHelper.getSettingsForUser({
              user_id,
              setting_type: SETTING_TYPES.AUTOMATED_TASK_SETTINGS,
            });
          if (errForAutomatedMailSettings) {
            logger.error(
              `Error while finding automatedMailSettings for user_id: ${user_id} `,
              errForAutomatedMailSettings
            );
            continue;
          }
          if (!automatedMailSettings?.Automated_Task_Setting) {
            logger.error(
              `Could not find automatedMailSettings for user_id: ${user_id}`
            );
            continue;
          }
          automatedMailSettingsMap[user_id] = automatedMailSettings;
        }

        if (automatedMailSettings) {
          const taskStartTime = await TaskHelper.getStartTimeForTask(
            timezone,
            0,
            automatedMailSettings?.Automated_Task_Setting
          );
          if (typeof taskStartTime === 'number')
            startTimeMap[user_id] = taskStartTime;
          else logger.error(`Invalid start time: ${taskStartTime}`);
        }
      }
      const [launchCadence, errForLaunchCadence] =
        await CadenceHelper.launchCadenceByRawQuery({
          cadence_id: cadence_id_to_start,
          create_from_node_id: firstNode.node_id,
          startTimeMap,
          t,
        });
      if (errForLaunchCadence) {
        const errorMessage = `Error while launching cadence by raw query: ${errForLaunchCadence}`;
        logger.error(errorMessage);
        return [null, errorMessage];
      }

      const [leadToCadenceStatusUpdate, errForLeadToCadenceStatusUpdate] =
        await Repository.update({
          tableName: DB_TABLES.LEADTOCADENCE,
          query: {
            cadence_id: cadence_id_to_start,
            status: CADENCE_LEAD_STATUS.NOT_STARTED,
          },
          updateObject: {
            status: CADENCE_LEAD_STATUS.IN_PROGRESS,
          },
          t,
        });
      if (errForLeadToCadenceStatusUpdate) {
        const errorMessage = `Error while updating lead to cadence: ${errForLeadToCadenceStatusUpdate}`;
        logger.error(errorMessage);
        return [null, errorMessage];
      }

      const unixTime = Math.round(new Date().getTime() / 1000);

      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.LAUNCH_CADENCE,
          variables: {
            cadence_name: cadenceToStart.name,
            first_name: user.first_name,
            last_name: user.last_name,
            launch_at: unixTime,
          },
          activity: {},
        });

      const [data, err] = await Repository.bulkCreate({
        tableName: DB_TABLES.ACTIVITY,
        createObject: leads.map((lead) => {
          return {
            lead_id: lead.lead_id,
            cadence_id: cadence_id_to_start,
            name: activityFromTemplate.name,
            status: activityFromTemplate.status,
            type: activityFromTemplate.type,
          };
        }),
        t,
      });
    }
    TaskHelper.recalculateDailyTasksForUsers([
      ...new Set(leads.map((lead) => lead.user_id)),
    ]);

    let LeadPromises = [];
    const SF_BATCH_SIZE = 13;
    if (user.integration_type === CRM_INTEGRATIONS.SALESFORCE) {
      for (let lead of leads) {
        LeadPromises.push(
          (async (lead) => {
            if (access_token && instance_url) {
              if (lead.salesforce_lead_id)
                await SalesforceService.createLeadCadenceMember(
                  cadenceToStart.salesforce_cadence_id,
                  lead.salesforce_lead_id,
                  cadenceToStart.status,
                  access_token,
                  instance_url
                );
              else if (lead.salesforce_contact_id)
                await SalesforceService.createContactCadenceMember(
                  cadenceToStart.salesforce_cadence_id,
                  lead.salesforce_contact_id,
                  cadenceToStart.status,
                  access_token,
                  instance_url
                );
            }
            // if (
            //   lead.integration_type ===
            //   LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD
            // ) {
            //   let googleSheetsFieldMap =
            //     userForFieldMap?.Company?.Company_Setting
            //       ?.Google_Sheets_Field_Map?.lead_map;

            //   const stopLead = stopLeads?.find((gsLead) => {
            //     return gsLead[googleSheetsFieldMap.lead_id] == lead.lead_id;
            //   });
            //   if (stopLead && stopLead?._rowNumber > 1) {
            //     // append stop lead from cadence_ids_to_stop into cadence_id_to_start
            //     dataToUpdate[cadenceToStart.salesforce_cadence_id].push({
            //       range: `${
            //         cadenceToStartSheetDetails?.name
            //       }!A${cadenceToStartLastRowNumber++}`,
            //       values: [stopLead._rawData],
            //     });
            //     // remove stop lead from cadence_ids_to_stop
            //     //dataToUpdate[cadenceToStop.salesforce_cadence_id].push({
            //     //range: `${cadenceToStopSheetDetails?.name}!A${stopLead._rowNumber}`,
            //     //values: [new Array(stopLead._rawData.length).fill('')],
            //     //});

            //     dataToUpdate[cadenceToStop.salesforce_cadence_id].push({
            //       deleteDimension: {
            //         range: {
            //           sheetId: 0,
            //           dimension: 'ROWS',
            //           startIndex: stopLead._rowNumber - 1,
            //           endIndex: stopLead._rowNumber,
            //         },
            //       },
            //       //range: `${cadenceToStopSheetDetails?.name}!A${stopLead._rowNumber}`,
            //     });
            //   }
            //   //startLeads = startLeads.sheetsByIndex[0];
            //   //startLeads.addRow(stopLead);
            //   //stopLead.delete();
            // }
          })(lead)
        );

        if (LeadPromises.length >= SF_BATCH_SIZE) {
          await Promise.allSettled(LeadPromises);
          LeadPromises = [];
          console.log('batch processed');
        }
      }
      if (LeadPromises.length) await Promise.allSettled(LeadPromises);
    }

    const deteteAndOrderPromises = [];

    // Updateing lead cadence order for targeted cadence
    deteteAndOrderPromises.push(
      LeadToCadenceHelper.updateLeadCadenceOrderForCadence(cadence_id_to_start)
    );

    // Updateing lead cadence order for previous cadences
    deteteAndOrderPromises.push(
      ...cadence_ids_to_stop.map((cadence) =>
        LeadToCadenceHelper.updateLeadCadenceOrderForCadence(cadence)
      )
    );

    const deleteQuery =
      option === BULK_OPTIONS.SELECTED
        ? {
            lead_id: {
              [Op.in]: lead_ids,
            },
            cadence_id: {
              [Op.in]: cadence_ids_to_stop,
            },
          }
        : {
            cadence_id: {
              [Op.in]: cadence_ids_to_stop,
            },
          };
    deteteAndOrderPromises.push(
      Repository.destroy({
        tableName: DB_TABLES.TASK,
        query: deleteQuery,
        t,
      })
    );

    // Delete automatedTasks belonging to this leads and cadence_ids_to_stop
    const deleteAutomatedTasksQuery =
      option === BULK_OPTIONS.SELECTED
        ? {
            lead_id: {
              [Op.in]: lead_ids,
            },
            cadence_id: {
              [Op.in]: cadence_ids_to_stop,
            },
          }
        : {
            cadence_id: {
              [Op.in]: cadence_ids_to_stop,
            },
          };

    deteteAndOrderPromises.push(
      AutomatedTasksHelper.deleteAutomatedTasks(deleteAutomatedTasksQuery, t)
    );
    //update cadenceToStart
    // if (user.integration_type === CRM_INTEGRATIONS.GOOGLE_SHEETS) {
    //   GoogleSheets.batchUpdate({
    //     spreadsheetId: cadenceToStart.salesforce_cadence_id,
    //     data: dataToUpdate[cadenceToStart.salesforce_cadence_id],
    //   });

    //   let deleteObject = dataToUpdate[cadenceToStop.salesforce_cadence_id];
    //   deleteObject?.sort((x, y) => {
    //     const x_weight = x?.deleteDimension?.range?.startIndex || 0;
    //     const y_weight = y?.deleteDimension?.range?.startIndex || 0;
    //     return y_weight - x_weight;
    //   });
    //   GoogleSheets.batchDelete({
    //     spreadsheetId: cadenceToStop.salesforce_cadence_id,
    //     data: deleteObject,
    //   });
    // }
    await Promise.allSettled(deteteAndOrderPromises);

    if (user.integration_type === CRM_INTEGRATIONS.SHEETS) {
      let [updateCadenceIntegrationType, errForUpdatingCadenceIntegrationType] =
        await CadenceHelper.updateCadenceIntegrationTypeForSheetsIntegration(
          cadence_ids_to_stop,
          t
        );
      if (errForUpdatingCadenceIntegrationType)
        return [
          null,
          `Error while updating cadence integration for sheets integration: ${errForUpdatingCadenceIntegrationType}`,
        ];
    }

    const [activityFromTemplate, errForActivityFromTemplate] =
      ActivityHelper.getActivityFromTemplates({
        type: ACTIVITY_TYPE.MOVE_CADENCE,
        variables: {
          cadence_name: cadenceToStart.name,
        },
        activity: {},
      });

    const [data, err] = await Repository.bulkCreate({
      tableName: DB_TABLES.ACTIVITY,
      createObject: leads.map((lead) => {
        return {
          lead_id: lead.lead_id,
          cadence_id: cadence_id_to_start,
          name: activityFromTemplate.name,
          status: activityFromTemplate.status,
          type: activityFromTemplate.type,
        };
      }),
      t,
    });
    logger.info(`Lead moved to cadence: ${cadence_id_to_start} successfully`);
    return [
      {
        msg: `Lead moved to cadence: ${cadence_id_to_start} successfully`,
        gsLeadIds,
      },
      null,
    ];

    // **********Commented code for GS****************
    // let dataToUpdate = {};
    // let cadenceToStartSheetDetails = {};
    // let cadenceToStopSheetDetails = {};
    // let stopLeads,
    //   startLeads = {};
    // let errForStopLeads,
    //   errForStartLeads = null;
    // let cadenceToStartLastRowNumber = 2;

    // if (req.user.integration_type === CRM_INTEGRATIONS.GOOGLE_SHEETS) {
    //   [
    //     { rows: stopLeads, sheetInfo: cadenceToStopSheetDetails },
    //     errForStopLeads,
    //   ] = await GoogleSheets.getSheet(
    //     cadenceToStop.salesforce_cadence_id, // id
    //     0, // sheet index
    //     true // fetch sheet details
    //   );
    //   if (errForStopLeads)
    //     return serverErrorResponseWithDevMsg({
    //       res,
    //       error: `Error while fetching leads freom sheet: ${errForStopLeads}`,
    //     });
    //   [
    //     { rows: startLeads, sheetInfo: cadenceToStartSheetDetails },
    //     errForStartLeads,
    //   ] = await GoogleSheets.getSheet(
    //     cadenceToStart.salesforce_cadence_id, // id
    //     0, // sheet index
    //     true // fetch sheet details
    //   );

    //   if (errForStartLeads)
    //     return serverErrorResponseWithDevMsg({
    //       res,
    //       error: `Error while starting leads: ${errForStartLeads}`,
    //       msg: 'Failed to start leads',
    //     });
    //   dataToUpdate = {
    //     [cadenceToStart.salesforce_cadence_id]: [],
    //     [cadenceToStop.salesforce_cadence_id]: [],
    //   };
    //   cadenceToStartLastRowNumber =
    //     startLeads[startLeads.length - 1]?._rowNumber + 1 || 2;
    //   // * Fetch google sheets field map
    //   let [userForFieldMap, errFetchingUser] = await Repository.fetchOne({
    //     tableName: DB_TABLES.USER,
    //     query: {
    //       user_id: req.user.user_id,
    //     },
    //     extras: {
    //       attributes: ['first_name'],
    //     },
    //     include: {
    //       [DB_TABLES.COMPANY]: {
    //         attributes: ['name'],
    //         [DB_TABLES.COMPANY_SETTINGS]: {
    //           [DB_TABLES.GOOGLE_SHEETS_FIELD_MAP]: {},
    //         },
    //       },
    //     },
    //   });
    //   if (errFetchingUser)
    //     return serverErrorResponseWithDevMsg({
    //       res,
    //       error: `Error while fetching user: ${errFetchingUser}`,
    //       msg: 'Failed to fetch user',
    //     });
    //   if (!userForFieldMap)
    //     return serverErrorResponseWithDevMsg({
    //       res,
    //       msg: 'Kindly ask admin to create field map',
    //     });
    // }
  } catch (err) {
    logger.error(`Error while moving leads to another cadence: `, err);
    return [null, err.message];
  }
};

module.exports = moveLeadsToAnotherCadence;
