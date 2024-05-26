const { createCallEvent, updateCallEvent } = require('./lib/callEvent');
const createMeetingEvent = require('./lib/meetingEvent');
const { checkDuplicates, getDuplicates } = require('./utils/checkDuplicate');
const { mergeDuplicates } = require('./lib/mergeDuplicates');
const { convertLead } = require('./lib/convertLead');
const Note = require('./lib/Note');
const { createSalesforceEmailMessage } = require('./lib/EmailMessage');
const { DisqualifyLead } = require('./lib/DisqualifyLead');
const { DisqualifyContact } = require('./lib/DisqualifyContact');
const { createMessageEvent } = require('./lib/messageEvent');
const {
  getAccountQualification,
  updateAccountQualification,
  getContactById,
  getAllAccountLeads,
} = require('./lib/accountQualification');
const {
  getLeadQualification,
  updateLeadQualification,
} = require('./lib/leadQualification');
const { getAccountTopics } = require('./lib/accountTopics');
const { getAccountFromSalesforce } = require('./lib/getAccount');
const { getLeadFromSalesforce } = require('./lib/getLead');
const {
  createCadence,
  updateCadence,
  deleteCadence,
  getCadence,
} = require('./lib/cadence');
const { updateAccountOwner } = require('./lib/updateAccountOwner');
const { updateContactOwner } = require('./lib/updateContactOwner');
const { updateLeadOwner } = require('./lib/updateLeadOwner');
const { getContact } = require('./lib/getContact');
const {
  getAllAccountsOfUserFromSalesforce,
} = require('./lib/getAllAccountsOfUser');
const {
  getCadenceMemberByCadenceIdAndLeadId,
  getCadenceMemberByCadenceIdAndContactId,
  updateCadenceMember,
  createContactCadenceMember,
  createLeadCadenceMember,
  deleteLeadCadenceMember,
} = require('./lib/cadenceMember');
const { getRedirectToUri, getARTokenUsingCode } = require('./lib/oauth');
const getAccessToken = require('./lib/getAccessToken');
const { updateAccount } = require('./lib/updateAccount');
const { updateContact } = require('./lib/updateContact');
const { updateLead } = require('./lib/updateLead');
const { bulkUpdateAccountOwner } = require('./lib/bulkUpdateAccountOwners');
const { bulkUpdateContactOwner } = require('./lib/bulkUpdateContactOwners');
const { bulkUpdateLeadOwner } = require('./lib/bulkUpdateLeadOwners');
const { getContactsFromList } = require('./lib/getContactsFromList');
const { getLeadsFromList } = require('./lib/getLeadsFromList');
const { query } = require('./lib/query');
const { describeObject } = require('./lib/describeObject');
const createAccount = require('./lib/createAccount');
const createContact = require('./lib/createContact');
const createLead = require('./lib/createLead');
const {
  getAllContactsFromAccount,
} = require('./lib/getAllContactsFromAccount');
const createTopic = require('./lib/createTopic');
const linkTopicToEntity = require('./lib/linkTopicToEntity');
const searchTopic = require('./lib/searchTopic');
const getTopicById = require('./lib/getTopicById');
const getTopicByName = require('./lib/getTopicByName');
const fetchCustomViews = require('./lib/fetchCustomViews');

module.exports = {
  createCallEvent,
  updateCallEvent,
  createMeetingEvent,
  checkDuplicates,
  getDuplicates,
  mergeDuplicates,
  convertLead,
  Note,
  createSalesforceEmailMessage,
  describeObject,
  DisqualifyLead,
  DisqualifyContact,
  createMessageEvent,
  getAccountQualification,
  updateAccountQualification,
  getAccountTopics,
  getContactById,
  getAllAccountLeads,
  getLeadQualification,
  updateLeadQualification,
  getAccountFromSalesforce,
  getLeadFromSalesforce,
  createCadence,
  updateCadence,
  deleteCadence,
  getCadence,
  getAccessToken,
  updateAccountOwner,
  updateContactOwner,
  updateLeadOwner,
  getCadenceMemberByCadenceIdAndLeadId,
  getCadenceMemberByCadenceIdAndContactId,
  updateCadenceMember,
  createContactCadenceMember,
  createLeadCadenceMember,
  deleteLeadCadenceMember,
  getAllAccountsOfUserFromSalesforce,
  getContact,
  getRedirectToUri,
  getARTokenUsingCode,
  updateAccount,
  updateContact,
  updateLead,
  bulkUpdateAccountOwner,
  bulkUpdateContactOwner,
  bulkUpdateLeadOwner,
  getContactsFromList,
  getLeadsFromList,
  query,
  createAccount,
  createContact,
  createLead,
  getAllContactsFromAccount,
  createTopic,
  linkTopicToEntity,
  searchTopic,
  getTopicById,
  getTopicByName,
  fetchCustomViews,
};
