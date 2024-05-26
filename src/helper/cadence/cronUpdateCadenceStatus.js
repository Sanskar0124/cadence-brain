// Utils
const logger = require('../../utils/winston');
const { CADENCE_STATUS, ACTIVITY_TYPE } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const CadenceRepository = require('../../repository/cadence.repository');
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');
const Repository = require('../../repository');

// Helpers and services
const CadenceHelper = require('../../helper/cadence');
const ActivityHelper = require('../../helper/activity');
const SalesforceService = require('../../services/Salesforce');
const TaskHelper = require('../task');

/**
 *
 * @deprecated
 */
const cronUpdateCadenceStatus = async () => {
  try {
    logger.info('Updating Cadence Statuses');
    let recalculateForUsers = [];
    const endDate = Date.now();

    // * Fetch all cadences that are paused and should be resumed
    const [cadences, errFetchingCadences] = await Repository.fetchAll({
      tableName: DB_TABLES.CADENCE,
      query: {
        status: CADENCE_STATUS.PAUSED,
        unix_resume_at: {
          [Op.lte]: endDate,
        },
      },
      extras: {
        attributes: ['cadence_id', 'name'],
      },
    });
    if (errFetchingCadences) return [null, errFetchingCadences];
    if (cadences.length === 0) return [null, 'No cadence to update'];
    let cadenceToNameMap = {};
    let cadencesToUpdate = [];

    for (let cadence of cadences) {
      cadencesToUpdate.push(cadence.cadence_id);
      cadenceToNameMap[cadence.cadence_id] = cadence.name;
    }

    await Promise.all(
      cadencesToUpdate.map((cadence_id) => {
        CadenceHelper.launchCadence(cadence_id, CADENCE_STATUS.PAUSED);
      })
    );

    const [data, errForCadenceUpdate] = await CadenceRepository.updateCadence(
      {
        cadence_id: {
          [Op.in]: cadencesToUpdate,
        },
      },
      {
        status: CADENCE_STATUS.IN_PROGRESS,
        unix_resume_at: null,
      }
    );
    if (errForCadenceUpdate) return [null, errForCadenceUpdate];

    // * Create and send activities
    let [leadToCadencesForActivities, errForLeadToCadencesForActivities] =
      await LeadToCadenceRepository.getLeadToCadenceLinksByLeadQuery(
        {
          cadence_id: {
            [Op.in]: cadencesToUpdate,
          },
        },
        {}
      );

    if (errForLeadToCadencesForActivities)
      return [null, errForLeadToCadencesForActivities];

    let activities = leadToCadencesForActivities.map((leadToCadence) => {
      const activity_status = `Cadence Resumed`;
      // push user_id of this user into recalculateForUsers
      recalculateForUsers.push(leadToCadence?.Leads[0].user_id);
      return {
        name: `${cadenceToNameMap[leadToCadence.cadence_id]} has been resumed`,
        cadence_id: leadToCadence.cadence_id,
        lead_id: leadToCadence.lead_id,
        status: activity_status,
        type: ACTIVITY_TYPE.RESUME_CADENCE,
        user_id: leadToCadence?.Leads[0].user_id,
        incoming: null,
      };
    });

    activities.filter((activity) => activity.name !== undefined);
    const [activityCreation, errForActivityCreation] =
      await ActivityHelper.bulkActivityCreation(activities);
    if (errForActivityCreation) logger.error(errForActivityCreation);

    // recalculate for users
    cadencesToUpdate.map((cadence_id) =>
      TaskHelper.recalculateDailyTasksForCadenceUsers(cadence_id)
    );

    //Salesforce task
    const salesforce_cadences = cadences.filter(
      (cadence) => cadence.salesforce_id
    );
    if (salesforce_cadences.length === 0)
      return [null, 'No cadence with Salesforce ID to update'];

    const updateResults = await Promise.all(
      salesforce_cadences.map((cadence) => {
        if (cadence.salesforce_cadence_id)
          [updatedSalesforceCadence, errForSalesforce] =
            SalesforceService.updateCadence({
              salesforce_cadence_id: cadence.salesforce_cadence_id,
              status: CADENCE_STATUS.IN_PROGRESS,
            });
      })
    );
  } catch (err) {
    logger.error(`Error while updating cadence status: `, err);
    return [null, err.message];
  }
};

module.exports = cronUpdateCadenceStatus;
