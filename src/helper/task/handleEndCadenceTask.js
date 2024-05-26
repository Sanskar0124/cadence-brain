// * Packages
const axios = require('axios');

// Utils
const logger = require('../../utils/winston');
const {
  NODE_TYPES,
  ACTIVITY_TYPE,
  CADENCE_LEAD_STATUS,
  WORKFLOW_TRIGGERS,
  LEAD_STATUS,
  LEAD_INTEGRATION_TYPES,
  WEBHOOK_TYPE,
  SALESFORCE_SOBJECTS,
  MODEL_TYPES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Db
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

// Models
const { sequelize } = require('../../db/models');

// Helpers and Services
const moveToCadence = require('../cadence/moveToCadence');
//const createTasksForLeads = require('./createTasksForLeads');
const SalesforceService = require('../../services/Salesforce');
const ActivityHelper = require('../activity');
const setLeadCadenceOrderToMax = require('../lead-to-cadence/setLeadCadenceOrderToMax');
const WorkflowHelper = require('../workflow');
const LeadHelper = require('../lead');
const recalculateDailyTasksForUsers = require('../task/recalculateDailyTasksForUsers');
const SalesforceHelper = require('../salesforce');
const AccessTokenHelper = require('../access-token');
const GoogleSheets = require('../../services/Google/Google-Sheets');

const handleEndCadenceTask = async ({ node, lead }) => {
  try {
    if (node.type !== NODE_TYPES.END) {
      logger.error(`Node Type 'end' expected, received ${node.type}.`);
      //return [null, `Node Type 'end' expected, received ${node.type}.`];
      return [null, `Unexpected error occurred, contact support.`];
    }
    let returnMsg = `Handled end cadence successfully.`;
    let cadence = '';

    let [fetchedLead, _] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: { lead_id: lead?.lead_id },
      extras: {
        attributes: [
          'lead_id',
          'user_id',
          'account_id',
          //'salesforce_lead_id',
          //'salesforce_contact_id',
          'integration_id',
          'integration_type',
        ],
      },
      include: {
        [DB_TABLES.ACCOUNT]: {
          attributes: [
            'account_id',
            'salesforce_account_id',
            'integration_id',
            'integration_type',
          ],
        },
        [DB_TABLES.USER]: {
          attributes: [
            'timezone',
            'salesforce_owner_id',
            'user_id',
            'integration_id',
          ],
          [DB_TABLES.COMPANY]: {
            attributes: ['integration_type', 'company_id'],
            [DB_TABLES.COMPANY_SETTINGS]: {
              attributes: ['user_id'],
              [DB_TABLES.GOOGLE_SHEETS_FIELD_MAP]: {},
            },
          },
        },
      },
    });
    if (!fetchedLead) {
      logger.error(`No lead found for lead_id: ${lead?.lead_id}.`);
      //return [null, `No lead found for lead_id: ${lead?.lead_id}.`];
      return [null, `No associated lead found for task.`];
    }

    lead = fetchedLead;

    // * Handle integration status updates
    if (
      node?.data?.lead_status ||
      node?.data?.account_status ||
      node?.data?.contact_status
    ) {
      logger.info('Updating lead and account status...');

      // * Following condition is only for integration_type : GOOGLE_SHEETS_LEAD
      if (
        node?.data?.lead_status &&
        fetchedLead.integration_type ==
          LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD
      ) {
        let googleSheetsFieldMap =
          fetchedLead?.User?.Company?.Company_Setting?.Google_Sheets_Field_Map
            ?.lead_map;
        const [leadForCadence, errForLead] = await Repository.fetchOne({
          tableName: DB_TABLES.LEAD,
          query: { lead_id: fetchedLead.lead_id },
          include: {
            [DB_TABLES.LEADTOCADENCE]: {
              [DB_TABLES.CADENCE]: {},
            },
          },
        });
        if (errForLead) return [null, errForLead];
        let cadences = [];
        leadForCadence.LeadToCadences.forEach((lead) => {
          cadences = cadences.concat(lead.Cadences);
        });
        for (let i = 0; i < cadences.length; i++) {
          let cadence = cadences[i];
          const [gsLeads, errForGsLeads] = await GoogleSheets.getSheet(
            cadence.salesforce_cadence_id
          );
          if (errForGsLeads && errForGsLeads.includes('403')) continue; // return [null, `Please provide edit access to "Anyone with the link" to the spreadsheet`]
          if (errForGsLeads) continue; //return [null, errForGsLeads]
          // Updating lead in google sheets
          const gsLead = await gsLeads.find((row) => {
            return row[googleSheetsFieldMap.lead_id] == fetchedLead.lead_id;
          });
          if (!gsLead) continue;
          gsLead[googleSheetsFieldMap.status] = node?.data?.lead_status;
          gsLead[googleSheetsFieldMap.comment] = node?.data?.lead_reason;
          gsLead.save();
        }
      }

      // * Get integration access token
      const [{ access_token, instance_url }, errForAccessToken] =
        await AccessTokenHelper.getAccessToken({
          user_id: lead?.User?.Company?.Company_Setting?.user_id, // sd admin
          integration_type: lead?.User?.Company?.integration_type,
        });
      if (!(access_token && instance_url)) {
        logger.error(`No access token or instance url found.`);
        //return [null, `No access token or instance url found.`];
        return [null, `Salesforce admin not connected`];
      }

      let isSfUpdated = false;

      // * Fetch salesforce field map
      const [salesforceFieldMap, errFetchingSalesforceFieldMap] =
        await SalesforceHelper.getFieldMapForCompanyFromUser(lead.user_id);
      if (errFetchingSalesforceFieldMap) {
        logger.error(`Unable to fetch salesforce field map`);
        //return [null, `Unable to fetch salesforce field map`];
        return [null, `Could not fetch salesforce field map`];
      }

      let { account_map, lead_map, contact_map } = salesforceFieldMap;

      // * Find convert, disqualify and custom webhooks of the company
      let [webhooks, errFetchingWebhooks] = await Repository.fetchAll({
        tableName: DB_TABLES.WEBHOOK,
        query: {
          webhook_type: {
            [Op.or]: [
              WEBHOOK_TYPE.CONVERT,
              WEBHOOK_TYPE.DISQUALIFY,
              WEBHOOK_TYPE.CUSTOM,
            ],
          },
        },
        include: {
          [DB_TABLES.COMPANY_SETTINGS]: {
            [DB_TABLES.COMPANY]: {
              where: {
                company_id: lead?.User?.Company?.company_id,
              },
              required: true,
              attributes: ['company_id'],
            },
            attributes: ['company_settings_id'],
            required: true,
          },
        },
      });
      if (errFetchingWebhooks) throw new Error(errFetchingWebhooks);

      let convertWebhook = false;
      let disqualifyWebhook = false;
      webhooks.forEach((webhook) => {
        if (webhook.webhook_type === WEBHOOK_TYPE.CONVERT)
          convertWebhook = webhook;
        if (webhook.webhook_type === WEBHOOK_TYPE.DISQUALIFY)
          disqualifyWebhook = webhook;
      });

      // * Handle Lead Status
      if (
        node?.data?.lead_status &&
        [LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD].includes(
          lead?.integration_type
        )
      ) {
        // * Is lead being disqualified and has the a disqualified webhook set?
        if (
          node?.data?.lead_status ===
            lead_map?.integration_status?.disqualified?.value &&
          disqualifyWebhook
        ) {
          // * Call disqualify webhook
          config = {
            method: disqualifyWebhook.http_method,
            url: disqualifyWebhook.url,
            headers: {
              Authorization: `Bearer ${disqualifyWebhook.auth_token}`,
              'Content-Type': 'application/json',
            },
            data: JSON.stringify({
              type: SALESFORCE_SOBJECTS.LEAD,
              Id: lead.integration_id,
              status: node?.data?.lead_status,
              reason: node.data.lead_reason,
            }),
          };
          await axios(config);

          isSfUpdated = true;
          logger.info('Successfully called disqualify endpoint');

          //TODO: Add relevant error handling logic
        } else if (
          node?.data?.lead_status ===
            lead_map?.integration_status?.converted?.value &&
          convertWebhook
        ) {
          // * Call convert webhook
          config = {
            method: convertWebhook.http_method,
            url: convertWebhook.url,
            headers: {
              Authorization: `Bearer ${convertWebhook.auth_token}`,
              'Content-Type': 'application/json',
            },
            data: JSON.stringify({
              type: SALESFORCE_SOBJECTS.LEAD,
              Id: lead.integration_id,
              status: node?.data?.lead_status,
            }),
          };
          await axios(config);

          isSfUpdated = true;
          logger.info('Successfully called convert endpoint');

          //TODO: Add relevant error handling logic
        } else {
          // * Check if target lead status is present in "custom webhooks"
          // ! This logic is only valid for salesforce
          let customActionWebhook = false;
          webhooks.forEach((webhook) => {
            if (
              webhook.webhook_type === WEBHOOK_TYPE.CUSTOM &&
              webhook.object_type === MODEL_TYPES.LEAD &&
              webhook.integration_status.value === node.data.lead_status
            )
              customActionWebhook = webhook;
          });

          // * If custom action webhook is true, then execute webhook
          if (customActionWebhook) {
            logger.info(
              `Executing custom action webhook : ${customActionWebhook.webhook_id}`
            );
            // * Call convert webhook
            config = {
              method: customActionWebhook.http_method,
              url: customActionWebhook.url,
              headers: {
                Authorization: `Bearer ${customActionWebhook.auth_token}`,
                'Content-Type': 'application/json',
              },
              data: JSON.stringify({
                type: MODEL_TYPES.LEAD,
                Id: lead.integration_id,
                status: node?.data?.lead_status,
              }),
            };
            await axios(config);

            isSfUpdated = true;
            logger.info('Successfully called custom webhook endpoint');
          } else {
            let updateObject = {};

            if (!lead_map?.integration_status?.name) {
              logger.error(`No lead status has been set`);
              return [null, 'Lead status is not set'];
            }

            if (node?.data?.lead_status)
              updateObject[lead_map?.integration_status?.name] =
                node.data.lead_status;

            const [data, err] = await SalesforceService.updateLeadQualification(
              lead.integration_id,
              updateObject,
              access_token,
              instance_url
            );
            if (!err) {
              logger.info(`Lead Qualification updated`);
              isSfUpdated = true;
            }
          }
        }
      }

      // * Handle Account Status
      if (
        node?.data?.account_status &&
        [LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT].includes(
          lead?.integration_type
        )
      ) {
        if (!account_map?.integration_status?.name) {
          logger.error(`No account status has been set`);
          return [null, 'Account status is not set'];
        }

        // * Is lead being disqualified and has the a disqualified webhook set?
        if (
          node?.data?.account_status ===
            account_map?.integration_status?.disqualified?.value &&
          disqualifyWebhook
        ) {
          // * Call disqualify webhook
          config = {
            method: disqualifyWebhook.http_method,
            url: disqualifyWebhook.url,
            headers: {
              Authorization: `Bearer ${disqualifyWebhook.auth_token}`,
              'Content-Type': 'application/json',
            },
            data: JSON.stringify({
              type: SALESFORCE_SOBJECTS.ACCOUNT,
              Id: lead.Account.integration_id,
              contactId: lead.integration_id,
              status: node?.data?.account_status,
              reason: node.data.account_reason,
            }),
          };
          await axios(config);

          isSfUpdated = true;
          logger.info('Successfully called disqualify endpoint');

          //TODO: Add relevant error handling logic
        } else if (
          node?.data?.account_status ===
            account_map?.integration_status?.converted?.value &&
          convertWebhook
        ) {
          // * Call convert webhook
          config = {
            method: convertWebhook.http_method,
            url: convertWebhook.url,
            headers: {
              Authorization: `Bearer ${convertWebhook.auth_token}`,
              'Content-Type': 'application/json',
            },
            data: JSON.stringify({
              type: SALESFORCE_SOBJECTS.ACCOUNT,
              Id: lead.Account.integration_id,
              contactId: lead.integration_id,
              status: node?.data?.account_status,
            }),
          };
          await axios(config);

          isSfUpdated = true;
          logger.info('Successfully called convert endpoint');

          //TODO: Add relevant error handling logic
        } else {
          // * Check if target account status is present in "custom webhooks"
          // ! This logic is only valid for salesforce
          let customActionWebhook = false;
          webhooks.forEach((webhook) => {
            if (
              webhook.webhook_type === WEBHOOK_TYPE.CUSTOM &&
              (webhook.object_type === MODEL_TYPES.ACCOUNT ||
                webhook.object_type === MODEL_TYPES.CONTACT) &&
              webhook.integration_status.value === node.data.account_status
            )
              customActionWebhook = webhook;
          });
          if (customActionWebhook) {
            logger.info(
              `Executing custom action webhook : ${customActionWebhook.webhook_id}`
            );
            // * Call convert webhook
            config = {
              method: customActionWebhook.http_method,
              url: customActionWebhook.url,
              headers: {
                Authorization: `Bearer ${customActionWebhook.auth_token}`,
                'Content-Type': 'application/json',
              },
              data: JSON.stringify({
                type: MODEL_TYPES.CONTACT,
                Id: lead.Account.integration_id,
                contactId: lead.integration_id,
                status: node?.data?.account_status,
              }),
            };
            await axios(config);

            isSfUpdated = true;
            logger.info('Successfully called custom webhook endpoint');
          } else {
            let updateObject = {};
            if (node?.data?.account_status)
              updateObject[account_map?.integration_status?.name] =
                node.data.account_status;
            // if (node?.data?.account_reason)
            //   updateObject.UnqualifiedReason__c = node.data.account_reason; // [!]: RINGOVER SPECIFIC CODE

            const [data, err] =
              await SalesforceService.updateAccountQualification(
                lead?.Account?.integration_id,
                updateObject,
                access_token,
                instance_url
              );
            // call stopcadenceforlead
            if (!err) {
              logger.info(`Account Qualification updated`);
              isSfUpdated = true;
            }
          }
        }
      }

      // * Handle Contact Status
      if (
        node?.data?.contact_status &&
        [LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT].includes(
          lead?.integration_type
        )
      ) {
        // * Is contact being disqualified and has the a disqualified webhook set?
        if (
          node?.data?.contact_status ===
            contact_map?.integration_status?.disqualified?.value &&
          disqualifyWebhook
        ) {
          // * Call disqualify webhook
          config = {
            method: disqualifyWebhook.http_method,
            url: disqualifyWebhook.url,
            headers: {
              Authorization: `Bearer ${disqualifyWebhook.auth_token}`,
              'Content-Type': 'application/json',
            },
            data: JSON.stringify({
              type: SALESFORCE_SOBJECTS.CONTACT,
              Id: lead.integration_id,
              status: node?.data?.contact_status,
              reason: node.data.contact_reason,
            }),
          };
          await axios(config);

          isSfUpdated = true;
          logger.info('Successfully called disqualify endpoint');
        } else if (
          node?.data?.contact_status ===
            contact_map?.integration_status?.converted?.value &&
          convertWebhook
        ) {
          // * Call convert webhook
          config = {
            method: convertWebhook.http_method,
            url: convertWebhook.url,
            headers: {
              Authorization: `Bearer ${convertWebhook.auth_token}`,
              'Content-Type': 'application/json',
            },
            data: JSON.stringify({
              type: SALESFORCE_SOBJECTS.CONTACT,
              Id: lead.integration_id,
              status: node?.data?.contact_status,
            }),
          };
          await axios(config);

          isSfUpdated = true;
          logger.info('Successfully called convert endpoint');

          //TODO: Add relevant error handling logic
        } else {
          // * Check if target lead status is present in "custom webhooks"
          // ! This logic is only valid for salesforce
          let customActionWebhook = false;
          webhooks.forEach((webhook) => {
            if (
              webhook.webhook_type === WEBHOOK_TYPE.CUSTOM &&
              webhook.object_type === MODEL_TYPES.LEAD &&
              webhook.integration_status.value === node.data.lead_status
            )
              customActionWebhook = webhook;
          });

          // * If custom action webhook is true, then execute webhook
          if (customActionWebhook) {
            logger.info(
              `Executing custom action webhook : ${customActionWebhook.webhook_id}`
            );
            // * Call convert webhook
            config = {
              method: customActionWebhook.http_method,
              url: customActionWebhook.url,
              headers: {
                Authorization: `Bearer ${customActionWebhook.auth_token}`,
                'Content-Type': 'application/json',
              },
              data: JSON.stringify({
                type: MODEL_TYPES.CONTACT,
                Id: lead.integration_id,
                status: node?.data?.contact_status,
              }),
            };
            await axios(config);

            isSfUpdated = true;
            logger.info('Successfully called custom webhook endpoint');
          } else {
            let updateObject = {};

            if (!contact_map?.integration_status?.name) {
              logger.error(`No lead status has been set`);
              return [null, 'Lead status is not set'];
            }

            if (node?.data?.contact_status)
              updateObject[contact_map?.integration_status?.name] =
                node.data.contact_status;

            const [data, err] = await SalesforceService.updateLeadQualification(
              lead.integration_id,
              updateObject,
              access_token,
              instance_url
            );
            if (!err) {
              logger.info(`Lead Qualification updated`);
              isSfUpdated = true;
            }
          }
        }
      }

      if (isSfUpdated) {
        // since its last node, mark cadence as completed and update lead cadence status as completed
        const [currentCadence, errForCurrentCadence] =
          await Repository.fetchOne({
            tableName: DB_TABLES.CADENCE,
            query: { cadence_id: node.cadence_id },
          });

        if (currentCadence) {
          cadence = currentCadence;
          // mark current lead cadence order as max
          const [leadCadenceOrderUpdate, errForLeadCadenceOrderUpdate] =
            await setLeadCadenceOrderToMax({
              lead_id: lead.lead_id,
              cadence_id: currentCadence.cadence_id,
            });
          if (!errForLeadCadenceOrderUpdate)
            logger.info(`lead-cadence-order updated to max.`);

          // mark current lead cadence status as completed
          const [data, err] = await Repository.update({
            tableName: DB_TABLES.LEADTOCADENCE,
            updateObject: {
              status:
                [
                  lead_map?.integration_status?.disqualified?.value,
                  lead_map?.integration_status?.converted?.value,
                ].includes(node?.data?.lead_status) ||
                [
                  account_map?.integration_status?.disqualified?.value,
                  account_map?.integration_status?.converted?.value,
                ].includes(node?.data?.account_status)
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : CADENCE_LEAD_STATUS.COMPLETED,
            },
            query: {
              lead_id: lead.lead_id,
              cadence_id: currentCadence.cadence_id,
            },
          });
          if (!err) logger.info(`Updated lead-to-cadence status.`);
        }

        logger.info(`Lead/account status changed`);
      }
    }

    // change ownership
    if (node?.data?.to_user_id) {
      // change owner
      await LeadHelper.changeOwner(lead, node.data.to_user_id);

      // calculate for both current and updated user
      recalculateDailyTasksForUsers([node.data.to_user_id, lead.user_id]);

      WorkflowHelper.applyWorkflow({
        trigger: WORKFLOW_TRIGGERS.WHEN_OWNERSHIP_CHANGES_IN_CADENCE,
        cadence_id: node.cadence_id,
        lead,
      });
    }

    if (node?.data?.cadence_id) {
      logger.info(`Moving to different cadence...`);
      // * dont create task for this node
      // * move to different cadence.
      const [data, err] = await moveToCadence(
        node.cadence_id, // from cadence
        node.data.cadence_id, // to cadence
        lead
      );

      // update moved leads array and update node
      const t = await sequelize.transaction();
      const [latestNode, errFetchingNode] = await Repository.fetchOne({
        tableName: DB_TABLES.NODE,
        query: {
          node_id: node.node_id,
        },
        t,
      });
      node = latestNode || node;
      let nodeData = node.data;
      nodeData.moved_leads.push(lead.lead_id);

      const [updateEndNode, errForEndNode] = await Repository.update({
        tableName: DB_TABLES.NODE,
        query: {
          node_id: node.node_id,
        },
        updateObject: {
          data: nodeData,
        },
        t,
      });
      if (errForEndNode)
        logger.error(
          `Error while adding lead id to end node data: `,
          errForEndNode
        );
      t.commit();
      if (data === `Moved,but creating task pending.`)
        returnMsg = `Moved,but creating task pending.`;
    }

    if (!cadence) {
      const [currentCadence, errForCurrentCadence] = await Repository.fetchOne({
        tableName: DB_TABLES.CADENCE,
        query: { cadence_id: node.cadence_id },
      });

      cadence = currentCadence;
    }
    if (cadence?.name) {
      // mark lead to cadence link as completed
      await Repository.update({
        tableName: DB_TABLES.LEADTOCADENCE,
        query: {
          lead_id: lead.lead_id,
          cadence_id: cadence.cadence_id,
        },
        updateObject: {
          status: CADENCE_LEAD_STATUS.COMPLETED,
        },
      });
      // activity for cadence completion
      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.COMPLETED_CADENCE,
          variables: {
            cadence_name: cadence.name,
          },
          activity: {
            lead_id: lead.lead_id,
            incoming: null,
            node_id: node.node_id,
          },
        });

      // create and send activity through socket
      await ActivityHelper.activityCreation(activityFromTemplate, lead.user_id);

      WorkflowHelper.applyWorkflow({
        trigger: WORKFLOW_TRIGGERS.WHEN_A_CADENCE_ENDS,
        lead_id: lead.lead_id,
        cadence_id: cadence.cadence_id,
      });
    }

    return [returnMsg, null];
  } catch (err) {
    logger.error(`Error while handling end cadence task: `, err);
    //return [null, err.message];
    return [null, `Unexpected error occurred, contact support.`];
  }
};

module.exports = handleEndCadenceTask;
