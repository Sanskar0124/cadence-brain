// Utils
const logger = require('../../utils/winston');
const {
  NODE_TYPES,
  CADENCE_STATUS,
  ACTIVITY_TYPE,
  CADENCE_LEAD_STATUS,
  LEAD_STATUS,
  SHEETS_CADENCE_INTEGRATION_TYPE,
} = require('../../utils/enums');
const { LEAD_CADENCE_ORDER_MAX } = require('../../utils/constants');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const CadenceRepository = require('../../repository/cadence.repository');
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');
const NodeRepository = require('../../repository/node.repository');
const Repository = require('../../repository');
const TaskRepository = require('../../repository/task.repository');

// Helpers and Services
//const LeadHelper = require('../lead');
const hasLeadUnsubscribed = require('../lead/hasLeadUnsubscribed');
const ActivityHelper = require('../activity');
const AutomatedTasksHelper = require('../automated-tasks');

const moveToCadence = async (from_cadence_id, to_cadence_id, lead) => {
  try {
    if (!to_cadence_id) {
      logger.error(`No cadence id found for lead to move.`);
      return [null, `No cadence id found for lead to move.`];
    }

    const [cadence, errForCadence] = await CadenceRepository.getCadence({
      cadence_id: to_cadence_id,
    });
    if (errForCadence) return [null, errForCadence];
    if (!cadence) return [null, `No cadence found with id: ${to_cadence_id}. `];

    const [fromCadence, errForFromCadence] = await CadenceRepository.getCadence(
      {
        cadence_id: from_cadence_id,
      }
    );
    if (errForFromCadence) return [null, errForFromCadence];
    if (!fromCadence)
      return [null, `No cadence found with id: ${from_cadence_id}. `];

    if (cadence.integration_type === SHEETS_CADENCE_INTEGRATION_TYPE.SHEETS)
      return [
        null,
        'Move to another cadence not supported for google sheet cadence',
      ];
    if (fromCadence.integration_type === SHEETS_CADENCE_INTEGRATION_TYPE.SHEETS)
      return [
        null,
        'Move to another cadence not supported for google sheet cadence',
      ];

    // * check if link exists
    let [link, errForLink] =
      await LeadToCadenceRepository.getLeadToCadenceLinkByQuery({
        cadence_id: to_cadence_id,
        lead_id: lead.lead_id,
      });
    if (errForLink) return [null, errForLink];

    // * fetch last lead number for user in cadence
    let [
      lastLeadToCadenceForUserInCadence,
      errForLastLeadToCadenceForUserInCadence,
    ] = await LeadToCadenceRepository.getLastLeadToCadenceByLeadQuery(
      {
        cadence_id: to_cadence_id,
        lead_cadence_order: {
          [Op.lt]: LEAD_CADENCE_ORDER_MAX,
        },
      }, // * lead_cadence_query
      { user_id: lead.user_id } // * lead_query
    );

    lastLeadToCadenceForUserInCadence = lastLeadToCadenceForUserInCadence?.[0];

    let lead_cadence_order = 0;

    // * If last link exists, use its leadCadenceOrder
    if (lastLeadToCadenceForUserInCadence)
      lead_cadence_order =
        (lastLeadToCadenceForUserInCadence?.lead_cadence_order || 0) + 1;
    // * If it does not exists, initialiaze it to 1
    else lead_cadence_order = 1;

    let [unsubscribed, ___] = await hasLeadUnsubscribed(lead.lead_id);

    const [leadsLink, errForLeadsLink] = await Repository.fetchAll({
      tableName: DB_TABLES.LEADTOCADENCE,
      query: { lead_id: lead.lead_id },
    });

    let is_bounced = 0;

    if (leadsLink?.length)
      for (let leadLink of leadsLink) if (leadLink.is_bounced) is_bounced = 1;

    // * create link
    let createdLink, errForCreatedLink;
    if (!link.length) {
      [createdLink, errForCreatedLink] =
        await LeadToCadenceRepository.createLeadToCadenceLink({
          cadence_id: to_cadence_id,
          lead_id: lead.lead_id,
          status:
            lead.status === LEAD_STATUS.CONVERTED ||
            lead.status === LEAD_STATUS.TRASH
              ? CADENCE_LEAD_STATUS.STOPPED
              : cadence.status === CADENCE_STATUS.IN_PROGRESS
              ? CADENCE_LEAD_STATUS.IN_PROGRESS
              : CADENCE_STATUS.NOT_STARTED,
          lead_cadence_order,
          unsubscribed: unsubscribed ?? false,
          is_bounced,
        });
      if (errForCreatedLink) return [null, errForCreatedLink];

      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.MOVE_CADENCE,
          variables: {
            cadence_name: cadence.name,
          },
          activity: {
            cadence_id: cadence.cadence_id,
            lead_id: lead.lead_id,
            user_id: lead.user_id,
            incoming: null,
          },
        });

      ActivityHelper.activityCreation(activityFromTemplate, lead.user_id);
    }
    // Deleting previous link if new was created
    const [deletedLink, errForDeletedLink] =
      await LeadToCadenceRepository.deleteLeadToCadenceLink({
        lead_id: lead.lead_id,
        cadence_id: from_cadence_id,
      });

    const [__, errForDeleteTasks] = await TaskRepository.deleteTasksByQuery({
      lead_id: lead.lead_id,
      cadence_id: from_cadence_id,
    });

    // Delete automatedTasks belonging to this leads and cadence_to_stop
    AutomatedTasksHelper.deleteAutomatedTasks({
      lead_id: lead.lead_id,
      cadence_id: from_cadence_id,
    });

    if (createdLink?.status === CADENCE_STATUS.IN_PROGRESS) {
      // * make task for first node in cadence

      const [firstNode, errForFirstNode] = await NodeRepository.getNode({
        cadence_id: to_cadence_id,
        is_first: 1,
      });

      if (errForFirstNode) {
        await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
          {
            lead_id: lead.lead_id,
            cadence_id,
          },
          {
            status: CADENCE_STATUS.NOT_STARTED,
          }
        );
        return [null, errForFirstNode];
      }

      if (!firstNode) {
        await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
          {
            lead_id: lead.lead_id,
            cadence_id,
          },
          {
            status: CADENCE_STATUS.NOT_STARTED,
          }
        );
        return [null, `No first node found for cadence: ${to_cadence_id}.`];
      }

      logger.info(`Moved,but creating task pending.`);
      return [`Moved,but creating task pending.`, null];
    }

    logger.info(`Moved but no task created.`);
    return [`Moved but no task created.`, null];
  } catch (err) {
    logger.error(`Error while moving to different cadence: `, err);
    return [null, err.message];
  }
};

module.exports = moveToCadence;

// (async () => {
//   const [lead, _] = await Repository.fetchOne({
//     tableName: DB_TABLES.LEAD,
//     query: {
//       lead_id: 5,
//     },
//   });
//   await moveToCadence(1, 3, lead);
//   await moveToCadence(2, 3, lead);
// })();
