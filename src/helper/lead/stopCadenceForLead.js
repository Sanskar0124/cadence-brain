// Utils
const logger = require('../../utils/winston');
const { ACTIVITY_TYPE, ACTIVITY_SUBTYPES } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const Repository = require('../../repository');
const TaskRepository = require('../../repository/task.repository');

// Helpers and services
const ActivityHelper = require('../activity');
const LeadToCadenceHelper = require('../lead-to-cadence');

const stopCadenceForLead = async (
  lead,
  cadence_ids,
  user = null,
  message_id = null
) => {
  try {
    for (let cadence_id of cadence_ids) {
      const [cadence, errForCadence] = await Repository.fetchOne({
        tableName: DB_TABLES.CADENCE,
        query: { cadence_id },
      });
      if (errForCadence) return [null, errForCadence];
      if (!cadence) return [null, 'Cadence not found'];

      const [updateLeadToCadenceStatus, errForUpdate] =
        await LeadToCadenceHelper.setLeadCadenceOrderToMax({
          lead_id: lead.lead_id,
          cadence_id,
        });
      if (errForUpdate) return [null, errForUpdate];

      const [task, errForTask] = await TaskRepository.getTask({
        lead_id: lead.lead_id,
        cadence_id: cadence_id,
        completed: false,
        is_skipped: false,
      });
      if (errForTask) return [null, errForTask];

      if (message_id) {
        const [fetchedActivity, errForFetchActivity] =
          await Repository.fetchOne({
            tableName: DB_TABLES.ACTIVITY,
            query: {
              lead_id: lead.lead_id,
              type: ACTIVITY_TYPE.STOP_CADENCE,
              message_id,
            },
          });
        if (errForFetchActivity) return [null, errForFetchActivity];

        if (!fetchedActivity) {
          const [activityFromTemplate, errForActivityFromTemplate] =
            ActivityHelper.getActivityFromTemplates({
              type: ACTIVITY_TYPE.STOP_CADENCE,
              sub_type: ACTIVITY_SUBTYPES.LEAD,
              variables: {
                cadence_name: cadence.name,
                first_name: user?.first_name || null,
                last_name: user?.last_name || null,
              },
              activity: {
                lead_id: lead.lead_id,
                incoming: null,
                node_id: task?.node_id ?? null,
                message_id,
              },
            });
          const [sendingActivity, errForSendingActivity] =
            await ActivityHelper.activityCreation(
              activityFromTemplate,
              lead.user_id
            );
        }
      } else {
        const [activityFromTemplate, errForActivityFromTemplate] =
          ActivityHelper.getActivityFromTemplates({
            type: ACTIVITY_TYPE.STOP_CADENCE,
            sub_type: ACTIVITY_SUBTYPES.LEAD,
            variables: {
              cadence_name: cadence.name,
              first_name: user?.first_name || null,
              last_name: user?.last_name || null,
            },
            activity: {
              lead_id: lead.lead_id,
              incoming: null,
              node_id: task?.node_id ?? null,
            },
          });
        const [sendingActivity, errForSendingActivity] =
          await ActivityHelper.activityCreation(
            activityFromTemplate,
            lead.user_id
          );
      }
    }

    logger.info(`Stopped cadence for lead.`);
    return [`Stopped cadence for lead.`, null];
  } catch (err) {
    logger.error(`Error while stopping cadence for lead: `, err);
    return [null, err.message];
  }
};

module.exports = stopCadenceForLead;
