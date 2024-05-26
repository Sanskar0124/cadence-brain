const getMapForLeads = require('./getMapForLeads');
const getMapForContacts = require('./getMapForContacts');
const getMapForAccounts = require('./getMapForAccounts');
const getTranslatedDay = require('./getTranslatedDay');
const getMatchedFallbackVariables = require('./getMatchedFallbackVariables');
const getDateRegexHelpers = require('./getDateRegexHelpers');

const CustomVariablesHelper = {
  getMapForLeads,
  getMapForContacts,
  getMapForAccounts,
  getTranslatedDay,
  getMatchedFallbackVariables,
  getDateRegexHelpers,
};

module.exports = CustomVariablesHelper;
