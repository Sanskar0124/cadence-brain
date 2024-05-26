const validateDomains = require('./domains/validateDomains');
const getSalesforceUserForCompany = require('./tokens/getSalesforceUserForCompany');
const getCrmIntegrationType = require('./getCrmIntegrationType');
const getIntegrationType = require('./getIntegrationType');
const changeIntegration = require('./changeIntegration');
const handleIntegrationTokensForIntegrationChange = require('./handleIntegrationTokensForIntegrationChange');
const getIntegrationSpecificThings = require('./getIntegrationSpecificThings');

module.exports = {
  validateDomains,
  getSalesforceUserForCompany,
  getCrmIntegrationType,
  getIntegrationType,
  changeIntegration,
  handleIntegrationTokensForIntegrationChange,
  getIntegrationSpecificThings,
};
