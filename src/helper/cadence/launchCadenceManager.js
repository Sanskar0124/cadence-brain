// Utils
const logger = require('../../utils/winston');

const {
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  ACTIVITY_TYPE,
  CRM_INTEGRATIONS,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const Repository = require('../../repository');
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');

// Helpers and Services
const launchCadence = require('./LaunchCadence');
const SalesforceService = require('../../services/Salesforce');
const ActivityHelper = require('../activity');
const TaskHelper = require('../task');
const AccessTokenHelper = require('../access-token');
const LeadToCadenceHelper = require('../lead-to-cadence');

/** Launches cadence using launch cadence helper
 * @param {Object} launchCadenceParams - Cadence, user, transaction
 * @param {Object} launchCadenceParams.cadence - Cadence to be launched
 * @param {Object} launchCadenceParams.user - User launching the cadence
 * @param {Object} launchCadenceParams.t - Sequelize transaction
 * @returns {Promise<[result: String, err: Error]>}
 */
const launchCadenceManager = async ({ cadence, user, t }) => {
  try {
    const cadence_id = cadence.cadence_id;
    cadence.created_timestamp = new Date().getTime();

    const [launchCadenceHelper, errForLaunchCadence] = await launchCadence(
      cadence,
      t
    );
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
    if (errForLeadToCadence)
      logger.error(`Error while fetching lead links:`, {
        err: errForLeadToCadence,
        user_id: user.user_id,
      });

    // Cadence is being resumed
    if (cadence.launch_date) {
      let [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.RESUME_CADENCE,
          variables: {
            cadence_name: cadence.name,
          },
          activity: {},
        });

      const [launchResumeActivity, errForLaunchResumeActivity] =
        await ActivityHelper.createActivityForLaunchResumeLeads({
          cadence_id,
          activity_name: activityFromTemplate.name,
          activity_status: activityFromTemplate.status,
          activity_type: activityFromTemplate.type,
          t,
        });
      if (errForLaunchResumeActivity)
        logger.error(`Error while creating activity for resume cadence: `, {
          err: errForLaunchResumeActivity,
          user_id: user.user_id,
        });

      const [cadenceStatusUpdate, errForCadenceStatusUpdate] =
        await Repository.update({
          tableName: DB_TABLES.CADENCE,
          query: {
            cadence_id,
          },
          updateObject: {
            status: CADENCE_STATUS.IN_PROGRESS,
            unix_resume_at: null,
          },
          t,
        });
      if (errForCadenceStatusUpdate) return [null, errForStatusUpdate];
    } else {
      const unixTime = Math.round(new Date().getTime() / 1000);
      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.LAUNCH_CADENCE,
          variables: {
            cadence_name: cadence.name,
            first_name: user.first_name,
            last_name: user.last_name,
            launch_at: unixTime,
          },
          activity: {},
        });

      const [launchResumeActivity, errForLaunchResumeActivity] =
        await ActivityHelper.createActivityForLaunchResumeLeads({
          cadence_id,
          activity_name: activityFromTemplate.name,
          activity_status: activityFromTemplate.status,
          activity_type: activityFromTemplate.type,
          t,
        });
      if (errForLaunchResumeActivity)
        logger.error(`Error while creating activity for launch cadence: `, {
          err: errForLaunchResumeActivity,
          user_id: user.user_id,
        });

      const [cadenceStatusUpdate, errForCadenceStatusUpdate] =
        await Repository.update({
          tableName: DB_TABLES.CADENCE,
          query: {
            cadence_id,
          },
          updateObject: {
            status: CADENCE_STATUS.IN_PROGRESS,
            unix_resume_at: null,
            launch_date: new Date(),
          },
          t,
        });
      if (errForCadenceStatusUpdate) return [null, errForCadenceStatusUpdate];
    }

    // fetch all leads who have reached last node and have the task marked as skipped
    // we have to create completed_cadence activity for such leads
    let [activityFromTemplate, errForActivityFromTemplate] =
      ActivityHelper.getActivityFromTemplates({
        type: ACTIVITY_TYPE.COMPLETED_CADENCE,
        variables: {
          cadence_name: cadence.name,
        },
      });

    const [completedLeadsActivity, errForCompletedLeadsActivity] =
      await ActivityHelper.createActivityForCompletedLeads({
        cadence_id,
        activity_type: activityFromTemplate.type,
        activity_name: activityFromTemplate.name,
        activity_status: activityFromTemplate.status,
        created_timestamp: cadence.created_timestamp,
        t,
      });
    if (errForCompletedLeadsActivity)
      logger.error(`Error while creating activity for completed leads: `, {
        err: errForCompletedLeadsActivity,
        user_id: user.user_id,
      });

    const [updateLeadCadence, errForUpdateLeadCadence] =
      await LeadToCadenceHelper.updateLeadToCadenceForCompletedLeads({
        cadence_id,
        created_timestamp: cadence.created_timestamp,
        status: CADENCE_LEAD_STATUS.COMPLETED,
        t,
      });
    if (errForUpdateLeadCadence)
      logger.error(
        `Error while updating lead to cadence for completed leads: `,
        {
          err: errForUpdateLeadCadence,
          user_id: user.user_id,
        }
      );

    // fetch deleted node ids having no next node id to create
    const deletedNodeIdsWithNoNextNodeToCreate = [];
    let metadata = cadence.metadata || {};
    for (let node_id of Object.keys(metadata))
      if (!metadata[node_id])
        deletedNodeIdsWithNoNextNodeToCreate.push(node_id);

    if (deletedNodeIdsWithNoNextNodeToCreate?.length) {
      const [deletedNodesActivity, errForDeletedNodes] =
        await ActivityHelper.createActivityForDeletedNodesWithNoNextNodes({
          cadence_id,
          activity_type: activityFromTemplate.type,
          activity_name: activityFromTemplate.name,
          activity_status: activityFromTemplate.status,
          node_ids: deletedNodeIdsWithNoNextNodeToCreate,
          t,
        });
      if (errForDeletedNodes)
        logger.error(`Error while creating activity for deleted nodes: `, {
          err: errForDeletedNodes,
          user_id: user.user_id,
        });

      const [leadCadenceUpdate, errForLeadCadenceUpdate] =
        await LeadToCadenceHelper.updateLeadToCadenceForDeletedNodesWithNoNextNodes(
          {
            cadence_id,
            status: CADENCE_LEAD_STATUS.COMPLETED,
            node_ids: deletedNodeIdsWithNoNextNodeToCreate,
            t,
          }
        );
      if (errForLeadCadenceUpdate)
        logger.error(`Error while updating leadToCadence for deleted nodes: `, {
          err: errForLeadCadenceUpdate,
          user_id: user.user_id,
        });
    }

    // Updating cadence status in salesforce
    if (cadence.salesforce_cadence_id) {
      // Fetching salesforce token and instance url
      const [{ access_token, instance_url }, errForAccessToken] =
        await AccessTokenHelper.getAccessToken({
          integration_type: CRM_INTEGRATIONS.SALESFORCE,
          user_id: user.user_id,
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

    return [true, null];
  } catch (err) {
    logger.error(`Error while launching cadence with launch manager: `, {
      err,
      user_id: user.user_id,
    });
    return [null, err.message];
  }
};

module.exports = launchCadenceManager;
