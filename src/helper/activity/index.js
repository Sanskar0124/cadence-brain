const createLinkedinActivity = require('./createLinkedinActivity');
const {
  activityCreation,
  bulkActivityCreation,
} = require('./activityCreation');
const createAndSendMailActivity = require('./createAndSendMailActivity');
const createAndSendReplyActivity = require('./createAndSendReplyActivity');
const getActivityFromTemplates = require('./getActivityFromTemplates');
const createAndSendOutOfOfficeActivity = require('./createAndSendOutOfOfficeActivity');
const createWhatsappActivity = require('./createWhatsappActivity');
const createExportLeadActivity = require('./createExportLeadActivity');
const createActivityForLaunchResumeLeads = require('./createActivityForLaunchResumeLeads');
const createActivityForCompletedLeads = require('./createActivityForCompletedLeads');
const createActivityForDeletedNodesWithNoNextNodes = require('./createActivityForDeletedNodesWithNoNextNodes');
const logMailActivity = require('./logMailActivity');

const ActivityHelper = {
  createLinkedinActivity,
  activityCreation,
  bulkActivityCreation,
  createAndSendMailActivity,
  createAndSendReplyActivity,
  getActivityFromTemplates,
  createAndSendOutOfOfficeActivity,
  createWhatsappActivity,
  createExportLeadActivity,
  createActivityForLaunchResumeLeads,
  createActivityForCompletedLeads,
  createActivityForDeletedNodesWithNoNextNodes,
  logMailActivity,
};

module.exports = ActivityHelper;
