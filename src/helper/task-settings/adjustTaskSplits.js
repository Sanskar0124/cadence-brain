// Utils
const logger = require('../../utils/winston');

const adjustTaskSplits = (task_setting) => {
  try {
    logger.info(`Some Buffer remaining, need to divide...`);

    let maxKeys = [];
    let maxNumber = 0;

    let keys = [
      'mails_per_day',
      'calls_per_day',
      'messages_per_day',
      'linkedin_connections_per_day',
      'linkedin_messages_per_day',
      'linkedin_profiles_per_day',
      'linkedin_interacts_per_day',
      'data_checks_per_day',
      'cadence_customs_per_day',
      //'reply_tos_per_day',
    ];
    for (let key of keys) {
      // if new max number found, update number and reset maxKeys array with only current key in it
      if (parseInt(task_setting[key]) > maxNumber) {
        maxNumber = parseInt(task_setting[key]);
        maxKeys = [key];
        // if another key found with same max number, add to array
      } else if (parseInt(task_setting[key]) === maxNumber) maxKeys.push(key);
    }

    const totalTasksCount =
      parseInt(task_setting.calls_per_day) +
      parseInt(task_setting.mails_per_day) +
      parseInt(task_setting.messages_per_day) +
      parseInt(task_setting.linkedin_connections_per_day) +
      parseInt(task_setting.linkedin_messages_per_day) +
      parseInt(task_setting.linkedin_profiles_per_day) +
      parseInt(task_setting.linkedin_interacts_per_day) +
      parseInt(task_setting.data_checks_per_day) +
      parseInt(task_setting.cadence_customs_per_day);
    //parseInt(task_setting.reply_tos_per_day);

    let buffer = parseInt(task_setting.max_tasks) - totalTasksCount;

    while (buffer != 0)
      for (let key of keys) {
        if (!maxKeys.includes(key)) {
          task_setting[key]++;
          buffer--;
          if (buffer === 0) break;
        }
      }

    logger.info(`Buffer adjusted.`);
    return [task_setting, null];
  } catch (err) {
    logger.error(`Error while adjusting task splits: `, err);
    return [null, err.message];
  }
};

module.exports = adjustTaskSplits;
