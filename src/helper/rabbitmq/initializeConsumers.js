// Utils
const logger = require('../../utils/winston');
const { AMQP_QUEUE, DAILY_USER_TASKS_QUEUE } = require('../../utils/constants');

// Helpers and Services
const TaskHelper = require('../task');
const consume = require('./consume');

const initializeConsumers = async () => {
  try {
    let data = null,
      error = null;
    // * consumers to process task
    [data, err] = await consume(AMQP_QUEUE, TaskHelper.consumeTaskFromQueue);
    if (err) return [null, err];
    [data, err] = await consume(AMQP_QUEUE, TaskHelper.consumeTaskFromQueue);
    if (err) return [null, err];
    [data, err] = await consume(AMQP_QUEUE, TaskHelper.consumeTaskFromQueue);
    if (err) return [null, err];

    let noOfRecalculateConsumers = 10;
    for (let i = 0; i < noOfRecalculateConsumers; i++) {
      // * consumers to calculate and store tasks for user
      [data, err] = await consume(
        DAILY_USER_TASKS_QUEUE,
        TaskHelper.calculateDailyTasks
      );
      if (err) return [null, err];
    }

    return [`Initialiazed all consumers`, null];
  } catch (err) {
    logger.error(`Error while initializing consumers: ${err.message}.`);
    return [null, err.message];
  }
};

module.exports = initializeConsumers;
