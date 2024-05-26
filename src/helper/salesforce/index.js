const getContactDataFromList = require('./getContactDataFromList');
const getContactDataFromSelections = require('./getContactDataFromSelections');
const getLeadDataFromList = require('./getLeadDataFromList');
const getLeadDataFromSelections = require('./getLeadDataFromSelections');
const {
  getFieldMapForCompanyFromUser,
  getFieldMapForCompanyFromCompany,
} = require('./getFieldMapForCompany');
const { getNameFieldForSobject } = require('./getNameFieldForSobject');
const importProfiles = require('./importProfiles');
const getOpportunityMetrics = require('./getOpportunityMetrics');
const createAndLinkTopics = require('./createAndLinkTopics');
const linkTopicsWithEntity = require('./linkTopicsWithEntity');
const updateLeadorContactStatus = require('./updateLeadorContactStatus');
const formatPickListCompanySize = require('./formatPickListCompanySize');

const SalesforceHelpers = {
  getContactDataFromList,
  getContactDataFromSelections,
  getLeadDataFromList,
  getLeadDataFromSelections,
  getFieldMapForCompanyFromUser,
  getFieldMapForCompanyFromCompany,
  getNameFieldForSobject,
  importProfiles,
  getOpportunityMetrics,
  createAndLinkTopics,
  linkTopicsWithEntity,
  updateLeadorContactStatus,
  formatPickListCompanySize,
};

module.exports = SalesforceHelpers;
