// Utils
const logger = require('../../utils/winston');
const { AWQ_QUEUE } = require('../../utils/constants');

// Helpers and Services
const AutomatedWorkflowHelper = require('../automated-workflow');
const consumeAdvanceWorkflow = require('./consumeAdvanceWorkflow');

const initializeAdvanceWorkflowConsumers = async () => {
  try {
    let data = null,
      err = null;

    let noOfAutomatedWorkflowConsumers = 20;
    for (let i = 0; i < noOfAutomatedWorkflowConsumers; i++) {
      // * Consumers to process advance workflow requests
      [data, err] = await consumeAdvanceWorkflow(
        AWQ_QUEUE,
        AutomatedWorkflowHelper.consumeAdvanceWorkflowFromQueue
      );
      if (err) return [null, err];
    }

    return [`Initialized all consumers`, null];
  } catch (err) {
    logger.error(`Error while initializing consumers: ${err.message}.`);
    return [null, err.message];
  }
};

module.exports = initializeAdvanceWorkflowConsumers;
