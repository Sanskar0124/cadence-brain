const removeLeadFromCadence = require('./removeLeadFromCadence');
const resetLeadCadenceOrder = require('./resetLeadCadenceOrder');
const hasLeadUnsubscribed = require('./hasLeadUnsubscribed');
const deleteAllLeadInfo = require('./deleteAllLeadInfo');
const {
  getSortedByRecentActivity,
  getTimeLimitTillFirstCall,
  removeHtmlTags,
} = require('./leads.helper');
const getPrimaryEmail = require('./getPrimaryEmail');
const getPrimaryPhoneNumber = require('./getPrimaryPhoneNumber');
const getSalesforceUrl = require('./getSalesforceUrl');
const getLeadsListFilter = require('./getLeadsListFilter');
const searchLeads = require('./searchLeads');
const createLead = require('./createLead');
const createTempLead = require('./createTempLead');
const linkTempLead = require('./linkTempLead');
const createContact = require('./createContact');
const changeOwner = require('./changeOwner');
const stopCadenceForLead = require('./stopCadenceForLead');
const reassignLeads = require('./reassignLeads');
const getUserDetails = require('./getUserDetails');
const { createLeadFromExternal } = require('./createLeadForExternal');
const deleteCadenceLeadInfo = require('./deleteCadenceLeadInfo');
const getLeadsListViewByRawQuery = require('./getLeadsListViewByRawQuery');
const getLeadsListFilterForRawQuery = require('./getLeadsListFilterForRawQuery');
const moveLeadsToAnotherCadence = require('./moveLeadsToAnotherCadence');

// * Salesforce import functions
const createLeadFromSalesforce = require('./salesforce/createLeadFromSalesforce');
const createContactFromSalesforce = require('./salesforce/createContactFromSalesforce');
const linkSalesforceLeadWithCadence = require('./salesforce/linkSalesforceLeadWithCadence');
const createExistingLeadFromSalesforce = require('./salesforce/createExistingLeadFromSalesforce');
const createExistingContactFromSalesforce = require('./salesforce/createExistingContactFromSalesforce');

// * Salesforce export functions
const exportLeadToSalesforce = require('./exportLeadToSalesforce');
const exportContactToSalesforce = require('./exportContactToSalesforce');

// * Pipedrive import functions
const createLeadFromPipedrive = require('./pipedrive/createLeadFromPipedrive');
const linkPipedriveLeadWithCadence = require('./pipedrive/linkPipedriveLeadWithCadence');

// * Pipedrive export functions
const exportPersonToPipedrive = require('./exportPersonToPipedrive');

// * Hubspot import functions
const createContactFromHubspotCSV = require('./hubspot/createContactFromHubspotCSV');
const linkHubspotLeadWithCadenceCSV = require('./hubspot/linkHubspotLeadWithCadenceCSV');

// * Hubspot export functions
const exportContactToHubspot = require('./hubspot/exportContactToHubspot');

// * Dynamics import functions
const createLeadFromDynamics = require('./dynamics/createLeadFromDynamics');
const createContactFromDynamics = require('./dynamics/createContactFromDynamics');
const linkDynamicsLeadWithCadence = require('./dynamics/linkDynamicsLeadWithCadence');

// * Bullhorn import functions
const createCandidateFromBullhorn = require('./bullhorn/createCandidateFromBullhorn');
const createLeadFromBullhorn = require('./bullhorn/createLeadFromBullhorn');
const createContactFromBullhorn = require('./bullhorn/createContactFromBullhorn');
const linkBullhornLeadWithCadence = require('./bullhorn/linkBullhornLeadsWithCadence');

// * Bullhorn export functions
const exportLeadToBullhorn = require('./exportLeadToBullhorn');
const exportContactToBullhorn = require('./exportContactToBullhorn');
const exportCandidateToBullhorn = require('./exportCandidateToBullhorn');

// * Sellsy import functions
const linkSellsyLeadWithCadence = require('./sellsy/linkSellsyLeadWithCadence');

// * Sellsy export functions
const exportContactToSellsy = require('./sellsy/exportContactToSellsy');

// * Zoho import functions
const createLeadFromZoho = require('./zoho/createLeadFromZoho');
const createContactFromZoho = require('./zoho/createContactFromZoho');
const linkZohoLeadWithCadence = require('./zoho/linkZohoLeadsWithCadence');

// * Zoho export functions
const exportLeadToZoho = require('./exportLeadToZoho');
const exportContactToZoho = require('./exportContactToZoho');

// Excel import
const createLeadForExcel = require('./excel/createLeadForExcel');
const linkLeadForExcel = require('./excel/linkLeadForExcel');

// Google sheets import
const createLeadForGoogleSheet = require('./google-sheets/createLeadForGoogleSheet');

// * Sellsy import functions
const createContactFromSellsy = require('./sellsy/createContactFromSellsy');

// Product tour import
const createLeadForProductTour = require('./product-tour/createLeadForProductTour');

// create dummy leads
const createDummyLeads = require('./createDummyLeads');

const leadIntegrationStatusHelper = require('./leadIntegrationStatusHelper');

const LeadHelper = {
  removeLeadFromCadence,
  resetLeadCadenceOrder,
  hasLeadUnsubscribed,
  deleteAllLeadInfo,
  getSortedByRecentActivity,
  getTimeLimitTillFirstCall,
  removeHtmlTags,
  getPrimaryEmail,
  getPrimaryPhoneNumber,
  getSalesforceUrl,
  getLeadsListFilter,
  searchLeads,
  createLead,
  createTempLead,
  createContact,
  changeOwner,
  stopCadenceForLead,
  reassignLeads,
  createLeadFromPipedrive,
  getUserDetails,
  createLeadFromExternal,
  deleteCadenceLeadInfo,
  getLeadsListViewByRawQuery,
  getLeadsListFilterForRawQuery,
  exportLeadToSalesforce,
  exportContactToSalesforce,
  exportPersonToPipedrive,
  exportContactToHubspot,
  exportLeadToZoho,
  exportContactToZoho,
  exportContactToSellsy,
  exportLeadToBullhorn,
  exportContactToBullhorn,
  exportCandidateToBullhorn,
  createLeadFromSalesforce,
  createContactFromSalesforce,
  createExistingContactFromSalesforce,
  linkSalesforceLeadWithCadence,
  createExistingLeadFromSalesforce,
  linkPipedriveLeadWithCadence,
  createContactFromHubspotCSV,
  linkHubspotLeadWithCadenceCSV,
  createContactFromDynamics,
  createLeadFromDynamics,
  linkDynamicsLeadWithCadence,
  linkSellsyLeadWithCadence,
  createCandidateFromBullhorn,
  createContactFromBullhorn,
  createLeadFromBullhorn,
  linkBullhornLeadWithCadence,
  createLeadForExcel,
  createLeadForGoogleSheet,
  createContactFromSellsy,
  createContactFromZoho,
  createLeadFromZoho,
  linkZohoLeadWithCadence,
  createLeadForProductTour,
  createDummyLeads,
  linkTempLead,
  linkLeadForExcel,
  moveLeadsToAnotherCadence,
  leadIntegrationStatusHelper,
};

module.exports = LeadHelper;
