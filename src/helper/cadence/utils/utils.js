const logger = require('../../../utils/winston');
const {
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  EMAIL_STATUS,
  ACTIVITY_TYPE,
  CADENCE_ACTIONS,
  WORKFLOW_TRIGGERS,
  CRM_INTEGRATIONS,
} = require('../../../utils/enums');

const { DB_TABLES } = require('../../../utils/modelEnums');

// Repositories
const CadenceRepository = require('../../../repository/cadence.repository');
const TaskRepository = require('../../../repository/task.repository');
const LeadToCadenceRepository = require('../../../repository/lead-to-cadence.repository');

// Helpers and Services
const CadenceHelper = require('../../../helper/cadence');
const SalesforceService = require('../../../services/Salesforce');
const ActivityHelper = require('../../../helper/activity');
const TaskHelper = require('../../../helper/task');
const Repository = require('../../../repository');
const AccessTokenHelper = require('../../access-token');

const launchCadence = async (cadence_id, user_id, status) => {
  try {
    const [user, errForUser] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: { user_id: user_id },
    });
    if (errForUser) return [null, errForUser];

    let [cadence, errForCadence] = await Repository.fetchOne({
      tableName: DB_TABLES.CADENCE,
      query: { cadence_id },
      include: {
        [DB_TABLES.USER]: { attributes: ['sd_id', 'company_id'] },
        [DB_TABLES.NODE]: { attributes: ['node_id'] },
      },
    });
    if (!cadence || errForCadence) return [null, errForCadence];

    const [access, errForAccess] = CadenceHelper.checkCadenceActionAccess({
      cadence: cadence,
      user,
      action: CADENCE_ACTIONS.UPDATE,
    });
    if (errForAccess) return [null, errForAccess];
    if (!access) return [null, 'You do not have access to this functionality.'];
    if (cadence.Nodes.length === 0)
      return [null, 'You can’t launch cadence with 0 steps.'];

    if (cadence.status === CADENCE_STATUS.PROCESSING)
      return [
        null,
        'You cannot resume a cadence that is currently processing. Kindly try again later.',
      ];

    await Repository.update({
      tableName: DB_TABLES.CADENCE,
      updateObject: { status: CADENCE_STATUS.PROCESSING },
      query: { cadence_id },
    });

    cadence.created_timestamp = new Date().getTime();

    const [launchCadence, errForLaunchCadence] =
      await CadenceHelper.launchCadence(cadence);
    if (errForLaunchCadence) return [null, errForLaunchCadence];

    // * create and send activities only for those leads which are 'IN_PROGRESS'
    const [leadToCadences, errForLeadToCadence] =
      await LeadToCadenceRepository.getLeadToCadenceLinksByLeadQuery(
        {
          cadence_id: cadence_id,
          status: CADENCE_LEAD_STATUS.IN_PROGRESS,
        },
        {}
      );
    if (errForLeadToCadence) logger.error(errForLeadToCadence);

    // Cadence is being resumed
    if (cadence.launch_date) {
      const activities = await Promise.all(
        leadToCadences.map(async (leadToCadence) => {
          // * Fetch latest task

          const [task, errForTask] = await TaskRepository.getTask({
            lead_id: leadToCadence.lead_id,
            cadence_id: cadence_id,
            completed: false,
            is_skipped: false,
          });
          if (errForTask) logger.error(errForTask);

          const [activityFromTemplate, errForActivityFromTemplate] =
            ActivityHelper.getActivityFromTemplates({
              type: ACTIVITY_TYPE.RESUME_CADENCE,
              variables: {
                cadence_name: cadence.name,
              },
              activity: {
                lead_id: leadToCadence.lead_id,
                user_id: leadToCadence?.Leads[0].user_id,
                incoming: null,
                node_id: task?.node_id ?? null,
              },
            });

          return activityFromTemplate;
        })
      );
      const [sendingActivity, errForSendingActivity] =
        await ActivityHelper.bulkActivityCreation(activities);
      if (errForSendingActivity) logger.error(errForSendingActivity);

      await CadenceRepository.updateCadence(
        { cadence_id },
        {
          status: CADENCE_STATUS.IN_PROGRESS,
          unix_resume_at: null,
        }
      );
    } else {
      const unixTime = Math.round(new Date().getTime() / 1000);

      const activities = leadToCadences.map((leadToCadence) => {
        const [activityFromTemplate, errForActivityFromTemplate] =
          ActivityHelper.getActivityFromTemplates({
            type: ACTIVITY_TYPE.LAUNCH_CADENCE,
            variables: {
              cadence_name: cadence.name,
              first_name: user.first_name,
              last_name: user.last_name,
              launch_at: unixTime,
            },
            activity: {
              cadence_id: cadence_id,
              lead_id: leadToCadence.lead_id,
              user_id: leadToCadence?.Leads[0].user_id,
              incoming: null,
            },
          });
        return activityFromTemplate;
      });
      const [sendingActivity, errForSendingActivity] =
        await ActivityHelper.bulkActivityCreation(activities);
      if (errForSendingActivity) logger.error(errForSendingActivity);

      await CadenceRepository.updateCadence(
        { cadence_id },
        {
          status: CADENCE_STATUS.IN_PROGRESS,
          unix_resume_at: null,
          launch_date: new Date(),
        }
      );
    }

    // Updating cadence status in salesforce
    if (cadence.salesforce_cadence_id) {
      // Fetching salesforce token and instance url
      const [{ access_token, instance_url }, errForAccessToken] =
        await AccessTokenHelper.getAccessToken({
          integration_type: CRM_INTEGRATIONS.SALESFORCE,
          user_id,
        });

      [updatedSalesforceCadence, errForSalesforce] =
        await SalesforceService.updateCadence(
          {
            salesforce_cadence_id: cadence.salesforce_cadence_id,
            status: CADENCE_STATUS.IN_PROGRESS,
          },
          access_token,
          instance_url
        );
    }

    // recalculate tasks for user belonging to this cadence
    TaskHelper.recalculateDailyTasksForCadenceUsers(cadence_id);
    return [null, 'Cadence is in process, tasks will be created soon.'];
  } catch (err) {
    logger.error(`Error while launching cadence:`, err);
    return [nulll, err.message];
  }
};

module.exports = { launchCadence };
