// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { ACTIVITY_TYPE } = require('../../utils/enums');

// Packages
const { workerData, parentPort } = require('worker_threads');

// Repository
const Repository = require('../../repository');

// Helpers and Services
const ActivityHelper = require('../activity');

const pauseCadenceActivityWorker = async ({
  leadToCadences,
  cadence_id,
  cadence,
  activity,
}) => {
  try {
    let activities = leadToCadences.map((leadToCadence) => ({
      cadence_id: leadToCadence.cadence_id,
      lead_id: leadToCadence.lead_id,
      user_id: leadToCadence?.Leads[0].user_id,
      incoming: null,
      ...activity,
    }));
    //const activities = await Promise.all(
    //leadToCadences.map(async (leadToCadence) => {
    ////const [task, errForTask] = await Repository.fetchOne({
    ////tableName: DB_TABLES.TASK,
    ////query: {
    ////lead_id: leadToCadence.lead_id,
    ////cadence_id: cadence_id,
    ////completed: false,
    ////is_skipped: false,
    ////},
    ////});
    ////if (errForTask) logger.error(errForTask);

    //const [activityFromTemplate, errForActivityFromTemplate] =
    //ActivityHelper.getActivityFromTemplates({
    //type: ACTIVITY_TYPE.PAUSE_CADENCE,
    //variables: {
    //cadence_name: cadence.name,
    //},
    //activity: {
    //cadence_id: leadToCadence.cadence_id,
    //lead_id: leadToCadence.lead_id,
    //user_id: leadToCadence?.Leads[0].user_id,
    //incoming: null,
    ////node_id: task?.node_id ?? null,
    //},
    //});

    //return activityFromTemplate;
    //})
    //);

    const [sendingActivity, errForSendingActivity] =
      await ActivityHelper.bulkActivityCreation(activities);
    if (errForSendingActivity) logger.error(errForSendingActivity);

    return [true, null];
  } catch (err) {
    logger.error(
      `Error while creating activity for pause cadence in worker: `,
      err
    );
    return [null, err.message];
  }
};

//(async function test() {
//console.log('hello');
//await pauseCadenceActivity(
//workerData.input,
//workerData.cadence_id,
//workerData.cadence
//);
//parentPort.postMessage({ fileName: workerData, status: 'Done' });
//})();

module.exports = pauseCadenceActivityWorker;
