const processLead = require('./processLead');
const processAction = require('./processAction');
const consumeAdvanceWorkflowFromQueue = require('./conusmeAdvanceWorkflowFromQueue');

const AutomatedWorkflowHelper = {
  processAction,
  processLead,
  consumeAdvanceWorkflowFromQueue,
};

module.exports = AutomatedWorkflowHelper;
