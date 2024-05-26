const sendActivity = require('./sendActivity');
const sendNotification = require('./sendNotification');
const sendDeleteTask = require('./sendDeleteTask');
const sendUpdateCompleteTask = require('./sendUpdateCompleteTask');
const sendRecalculateEvent = require('./sendRecalculateEvent');
const sendCadenceImportLoaderEvent = require('./sendCadenceImportLoaderEvent');
const sendChatbotMessageToUser = require('./sendChatbotMessageToUser');
const sendProfiles = require('./sendProfiles');
const sendCadenceImportResponseEvent = require('./sendCadenceImportResponseEvent');
const sendIntegrationChangeLogsEvent = require('./sendIntegrationChangeLogsEvent');

const SocketHelper = {
  sendActivity,
  sendNotification,
  sendDeleteTask,
  sendUpdateCompleteTask,
  sendRecalculateEvent,
  sendCadenceImportLoaderEvent,
  sendChatbotMessageToUser,
  sendProfiles,
  sendCadenceImportResponseEvent,
  sendIntegrationChangeLogsEvent,
};

module.exports = SocketHelper;
