// Utils
const logger = require('../../utils/winston');
const {
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  WORKFLOW_TRIGGERS,
  LEAD_STATUS,
  SETTING_TYPES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE,
} = require('../../utils/constants');

//models
const { sequelize } = require('../../db/models');

// Packages
const { Op } = require('sequelize');

// Repositories
const NodeRepository = require('../../repository/node.repository');
const Repository = require('../../repository');

// Helpers and services
const createTasksForLeads = require('../task/createTasksForLeads');
const WorkflowHelper = require('../workflow');
const getStartTimeForTask = require('../task/getStartTimeForTask');
const getSettingsForUser = require('../user/getSettingsForUser');
const launchCadenceByRawQuery = require('./launchCadenceByRawQuery');
const resumeCadenceByRawQuery = require('./resumeCadenceByRawQuery');

const getAutomatedSettingsAndStartTime = async (usersOfLeads) => {
  try {
    let startTimeMap = {};
    let automatedMailSettingsMap = {};
    for (let user of usersOfLeads) {
      let user_id = user?.Leads?.[0]?.user_id || user?.Lead?.user_id;
      let timezone =
        user?.Leads?.[0]?.User?.timezone || user?.Lead?.User?.timezone;

      if (!automatedMailSettingsMap[user_id]) {
        const [automatedMailSettings, err] = await getSettingsForUser({
          user_id,
          setting_type: SETTING_TYPES.AUTOMATED_TASK_SETTINGS,
        });

        if (err) {
          logger.error(
            `Error fetching automatedMailSettings for user_id: ${user_id} `,
            err
          );
          continue;
        }

        if (!automatedMailSettings) {
          logger.error(
            `Could not find automatedMailSettings for user_id: ${user_id}`
          );
          continue;
        }

        automatedMailSettingsMap[user_id] = automatedMailSettings;
      }

      const startTime = await getStartTimeForTask(
        timezone,
        0,
        automatedMailSettingsMap[user_id]?.Automated_Task_Setting
      );

      if (typeof startTime === 'number') {
        startTimeMap[user_id] = startTime;
      } else {
        logger.error(`Invalid start time: ${startTime}`);
      }
    }

    return [startTimeMap, automatedMailSettingsMap, null];
  } catch (err) {
    return [null, null, err];
  }
};

const LaunchTasksForCadences = async (
  { cadence_id, status, name, created_timestamp, salesforce_cadence_id },
  t
) => {
  try {
    const [cadenceLeads, errForCadenceLeads] = await Repository.fetchAll({
      tableName: DB_TABLES.LEADTOCADENCE,
      query: {
        cadence_id,
      },
      include: {
        [DB_TABLES.LEAD]: {
          where: {
            status: { [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING] },
          },
          [DB_TABLES.LEAD_EMAIL]: {},
          [DB_TABLES.ACCOUNT]: {},
          [DB_TABLES.LEAD_PHONE_NUMBER]: {},
          [DB_TABLES.USER]: {},
        },
      },
      t,
    });
    if (errForCadenceLeads) return [null, errForCadenceLeads];

    // * fetch first node in cadence
    const [firstNode, errForFirstNode] = await NodeRepository.getNode({
      cadence_id,
      is_first: 1,
    });
    if (errForFirstNode) return [null, errForFirstNode];

    // * seperate leads from cadenceLeads
    const leads = cadenceLeads
      .filter((cl) => cl?.Leads && cl?.Leads?.length)
      .map((cl) => cl.Leads[0]);
    // Declare varibales for fetching users start time and automated mail settings
    let startTimeMap, automatedMailSettingsMap, err;

    // * if cadence has been scheduled to either launch or resume -> remove schedule
    if (status === CADENCE_STATUS.NOT_STARTED) {
      // *removed any launching schedules if present

      const [removedSchedule, errForRemovedSchedule] = await Repository.destroy(
        {
          tableName: DB_TABLES.CADENCE_SCHEDULE,
          query: {
            cadence_id,
          },
          t,
        }
      );

      if (errForRemovedSchedule) return [null, errForRemovedSchedule];

      let usersOfLeads, errForUsersOfLeads;

      // if cadence is a product tour demo cadence then tasks will be created with current time, so no need to calculate start time
      if (salesforce_cadence_id !== INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE) {
        [usersOfLeads, errForUsersOfLeads] = await Repository.fetchAll({
          tableName: DB_TABLES.LEADTOCADENCE,
          query: {
            cadence_id, // belongs to this cadence
            status: CADENCE_LEAD_STATUS.NOT_STARTED,
          },
          include: {
            [DB_TABLES.LEAD]: {
              attributes: ['user_id'],
              [DB_TABLES.USER]: {
                attributes: ['timezone'],
              },
            },
          },
          extras: {
            group: ['Leads.User.user_id'],
            attributes: ['lead_id', 'cadence_id'],
          },
          t,
        });
        if (errForUsersOfLeads)
          return [
            null,
            `Error while fetching lead to cadence: ${errForUsersOfLeads}`,
          ];
      }

      usersOfLeads = usersOfLeads || [];
      [startTimeMap, automatedMailSettingsMap, err] =
        await getAutomatedSettingsAndStartTime(usersOfLeads);
      if (err) return [null, `Error while fetching settings: ${startTimeMap}`];

      const [launchCadence, errForLaunchCadence] =
        await launchCadenceByRawQuery({
          cadence_id,
          create_from_node_id: firstNode.node_id,
          startTimeMap,
          metadataCreatedTimestamp: created_timestamp,
          t,
        });
      if (errForLaunchCadence)
        return [
          null,
          `Error while launching cadence by raw query: ${errForLaunchCadence}`,
        ];

      // * update status for all links with status "not_started"
      const [leadToCadenceStatusUpdate, errForLeadToCadenceStatusUpdate] =
        await Repository.update({
          tableName: DB_TABLES.LEADTOCADENCE,
          query: {
            cadence_id,
            status: CADENCE_LEAD_STATUS.NOT_STARTED,
          },
          updateObject: {
            status: CADENCE_LEAD_STATUS.IN_PROGRESS,
          },
          t,
        });
      // Rollback
      if (errForLeadToCadenceStatusUpdate)
        return [
          null,
          `Error while updating lead to cadence: ${errForLeadToCadenceStatusUpdate}`,
        ];

      await Repository.update({
        tableName: DB_TABLES.CADENCE,
        query: { cadence_id },
        updateObject: { metadata: {} },
        t,
      });

      //await createTasksForLeads({
      //leads,
      //node: firstNode,
      //cadence_id,
      //});
    } else if (status === CADENCE_STATUS.PAUSED) {
      // TODO: remove once feature is stable
      console.log('in paused');
      const [removedSchedule, errForRemovedSchedule] = await Repository.destroy(
        {
          tableName: DB_TABLES.CADENCE_SCHEDULE,
          query: {
            cadence_id,
          },
          t,
        }
      );
      if (errForRemovedSchedule)
        return [
          null,
          `Error while deleteing cadence schedule: ${errForRemovedSchedule}`,
        ];

      const [cadence, errForCadence] = await Repository.fetchOne({
        tableName: DB_TABLES.CADENCE,
        query: { cadence_id },
        t,
      });
      if (errForCadence)
        return [null, `Error while fetching cadence: ${errForCadence}`];
      if (!cadence) {
        logger.error(`Cannot fetch cadence.`);
        return [null, `Cannot fetch cadence.`];
      }
      // * If cadence is paused and then started, create tasks for new leads only i.e leads with no tasks.

      //// Current node is not found
      /*
       * Possiblities:
       * Deleted the current node
       * Deleted the previous nodes so all the tasks completed by the user already, none of the node ids exist
       * Delete all nodes lol
       * */
      //}

      let metadata = cadence.metadata || {};
      let usersOfLeads, errForUsersOfLeads;

      if (salesforce_cadence_id !== INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE) {
        [usersOfLeads, errForUsersOfLeads] = await Repository.fetchAll({
          tableName: DB_TABLES.TASK,
          query: {
            cadence_id, // belongs to this cadence
            node_id: {
              [Op.in]: Object.keys(metadata),
            },
          },
          include: {
            [DB_TABLES.LEAD]: {
              attributes: ['user_id'],
              [DB_TABLES.USER]: {
                attributes: ['timezone'],
              },
            },
          },
          extras: {
            group: ['Lead.User.user_id'],
            attributes: ['lead_id', 'cadence_id'],
          },
          t,
        });
        if (errForUsersOfLeads) return [null, errForUsersOfLeads];
      }

      usersOfLeads = usersOfLeads || [];
      [startTimeMap, automatedMailSettingsMap, err] =
        await getAutomatedSettingsAndStartTime(usersOfLeads);
      if (err) return [null, `Error while fetching settings: ${startTimeMap}`];

      for (let deleted_node_id of Object.keys(metadata)) {
        const [resumeCadence, errForResumeCadence] =
          await resumeCadenceByRawQuery({
            cadence_id,
            resume_from_node_id: deleted_node_id,
            create_from_node_id: metadata[deleted_node_id],
            startTimeMap,
            metadataCreatedTimestamp: created_timestamp,
            t,
          });
        if (errForResumeCadence) return [null, errForResumeCadence];
      }

      // * fetch first node in cadence
      const [firstNode, errForFirstNode] = await NodeRepository.getNode({
        cadence_id,
        is_first: 1,
      });

      usersOfLeads = null;
      errForUsersOfLeads = null;
      if (salesforce_cadence_id !== INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE) {
        [usersOfLeads, errForUsersOfLeads] = await Repository.fetchAll({
          tableName: DB_TABLES.LEADTOCADENCE,
          query: {
            cadence_id, // belongs to this cadence
            status: CADENCE_LEAD_STATUS.NOT_STARTED,
          },
          include: {
            [DB_TABLES.LEAD]: {
              attributes: ['user_id'],
              [DB_TABLES.USER]: {
                user_id: {
                  [Op.notIn]: Object.keys(startTimeMap),
                },
                attributes: ['timezone'],
                required: true,
              },
            },
          },
          extras: {
            group: ['Leads.User.user_id'],
            attributes: ['lead_id', 'cadence_id'],
          },
          t,
        });
        if (errForUsersOfLeads) return [null, errForUsersOfLeads];
      }

      usersOfLeads = usersOfLeads || [];
      [startTimeMap, automatedMailSettingsMap, err] =
        await getAutomatedSettingsAndStartTime(usersOfLeads);
      if (err) return [null, `Error while fetching settings: ${startTimeMap}`];

      const [launchCadence, errForLaunchCadence] =
        await launchCadenceByRawQuery({
          cadence_id,
          create_from_node_id: firstNode.node_id,
          startTimeMap,
          metadataCreatedTimestamp: created_timestamp,
          t,
        });
      if (errForLaunchCadence) return [null, errForLaunchCadence];

      // * update status for all links with status "not_started"
      const [leadToCadenceStatusUpdate, errForLeadToCadenceStatusUpdate] =
        await Repository.update({
          tableName: DB_TABLES.LEADTOCADENCE,
          query: {
            cadence_id,
            status: CADENCE_LEAD_STATUS.NOT_STARTED,
          },
          updateObject: {
            status: CADENCE_LEAD_STATUS.IN_PROGRESS,
          },
          t,
        });
      // Rollback
      if (errForLeadToCadenceStatusUpdate)
        return [
          null,
          `Error while updating lead to cadence status update: ${errForLeadToCadenceStatusUpdate}`,
        ];

      const [updateMetadata, errForMetadataUpdate] = await Repository.update({
        tableName: DB_TABLES.CADENCE,
        query: { cadence_id },
        updateObject: { metadata: {} },
        t,
      });
      if (errForMetadataUpdate)
        return [
          null,
          `Error while updating cadence meta data: ${errForMetadataUpdate}`,
        ];

      //await createTasksForLeads({
      //leads: newLeads,
      //node: firstNode,
      //cadence_id,
      //});
    }

    // apply workflow to leads whose cadence is completed
    const [leadsWhoseCadenceIsCompleted, errForLeadsWhoseCadenceIsCompleted] =
      await Repository.fetchAll({
        tableName: DB_TABLES.TASK,
        query: {
          [Op.and]: [
            { cadence_id },
            { is_skipped: 1 },
            sequelize.where(
              sequelize.literal(
                'json_extract(task.metadata,"$.created_timestamp")'
              ),
              {
                [Op.eq]: created_timestamp,
              }
            ),
          ],
        },
        include: {
          [DB_TABLES.NODE]: {
            where: {
              next_node_id: null,
            },
            required: true,
            attributes: [],
          },
        },
        extras: {
          attributes: ['lead_id'],
        },
      });
    if (errForLeadsWhoseCadenceIsCompleted)
      return [null, `Error while fetching leads whose cadence is completed`];
    if (leadsWhoseCadenceIsCompleted?.length)
      // apply workflow
      for (let lead of leadsWhoseCadenceIsCompleted)
        WorkflowHelper.applyWorkflow({
          trigger: WORKFLOW_TRIGGERS.WHEN_A_CADENCE_ENDS,
          cadence_id,
          lead_id: lead.lead_id,
        });

    return [leads, null];
  } catch (err) {
    // TODO: remove once feature is stable
    console.log(err);
    logger.error(`Error in LaunchTasksForCadences: `, err);
    return [null, err.message];
  }
};

module.exports = LaunchTasksForCadences;
