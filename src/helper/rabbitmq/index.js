const produce = require('./produce');
const consume = require('./consume');
const initializeConsumers = require('./initializeConsumers');
const initializeAdvanceWorkflowConsumer = require('./initializeAdvanceWorkflowConsumer');
const consumeAdvanceWorkflow = require('./consumeAdvanceWorkflow');

const RabbitMqHelper = {
  produce,
  consume,
  initializeConsumers,
  initializeAdvanceWorkflowConsumer,
  consumeAdvanceWorkflow,
};

module.exports = RabbitMqHelper;
