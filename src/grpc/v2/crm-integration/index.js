const describeObject = require('./describeObject');
const createCallActivity = require('./createCallActivity');
const createCalendarActivity = require('./createCalendarActivity');
const createSmsActivity = require('./createSmsActivity');
const createNoteActivity = require('./createNoteActivity');
const createMailActivity = require('./createMailActivity');
const createLunchActivity = require('./createLunchActivity');
const createDeadlineActivity = require('./createDeadlineActivity');
const getContact = require('./getContact');
const getDuplicate = require('./getDuplicate');
const getLead = require('./getLead');
const getAccount = require('./getAccount');
const getUser = require('./getUser');
const updateAccount = require('./updateAccount');
const updateContact = require('./updateContact');
const updateLead = require('./updateLead');
const addWebhook = require('./addWebhook');
const getWebhooks = require('./getWebhooks');
const deleteWebhook = require('./deleteWebhook');
const createActivityType = require('./createActivityType');
const fetchActivityTypes = require('./fetchActivityTypes');
const deleteActivityType = require('./deleteActivityType');
const getRelatedLead = require('./getRelatedLead');
const updateWebhook = require('./updateWebhook');
const createOpportunity = require('./createOpportunity');
const updateOpportunity = require('./updateOpportunity');
const deleteOpportunity = require('./deleteOpportunity');
const getContactsFromList = require('./getContactsFromList');
const searchAccount = require('./searchAccount');
const searchContact = require('./searchContact');
const bulkUpdateContactOwners = require('./bulkUpdateContactOwners');
const bulkUpdateAccountOwners = require('./bulkUpdateAccountOwners');
const bulkUpdateLeadOwners = require('./bulkUpdateLeadOwners');
const describePicklist = require('./describePicklist');

module.exports = {
  describeObject,
  createCallActivity,
  createCalendarActivity,
  createSmsActivity,
  createNoteActivity,
  createMailActivity,
  createLunchActivity,
  createDeadlineActivity,
  getContact,
  getDuplicate,
  getRelatedLead,
  getLead,
  getAccount,
  getUser,
  updateAccount,
  updateContact,
  updateLead,
  addWebhook,
  getWebhooks,
  deleteWebhook,
  updateWebhook,
  createActivityType,
  fetchActivityTypes,
  deleteActivityType,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getContactsFromList,
  searchAccount,
  searchContact,
  bulkUpdateContactOwners,
  bulkUpdateAccountOwners,
  bulkUpdateLeadOwners,
  describePicklist,
};
