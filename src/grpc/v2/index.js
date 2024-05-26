const advancedWorkflow = require('./advanced-workflow');
const calendar = require('./calendar');
const mail = require('./mail');
const message = require('./message');
const crmIntegration = require('./crm-integration');
const hiringIntegration = require('./hiring-integration');

const v2GrpcClients = {
  advancedWorkflow,
  calendar,
  mail,
  message,
  crmIntegration,
  hiringIntegration,
};

module.exports = v2GrpcClients;
