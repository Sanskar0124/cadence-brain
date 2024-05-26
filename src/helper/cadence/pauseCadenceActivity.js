// Utils
const logger = require('../../utils/winston');

// Packages
const path = require('path');
const os = require('os');

const pauseCadenceActivity = ({
  leadToCadences,
  cadence_id,
  cadence,
  activity,
}) => {
  try {
    let input_length = leadToCadences.length;
    const no_of_cores = os.cpus().length;
    let batch = Math.min(
      leadToCadences.length,
      Math.ceil(input_length / no_of_cores)
    );

    while (leadToCadences.length) {
      const splicedInput = leadToCadences.splice(0, batch);

      global.worker_pool.runTask(
        {
          leadToCadences: splicedInput,
          cadence_id,
          cadence,
          activity,
        },
        path.join(__dirname, './pauseCadenceActivityWorker')
      );
    }
    return ['Initiated process in worker threads.', null];
  } catch (err) {
    logger.error(`Error while creating activity for pause cadence: `, err);
    return [null, err.message];
  }
};

module.exports = pauseCadenceActivity;
