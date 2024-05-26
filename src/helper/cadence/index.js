const addNodeToCadence = require('./addNodeToCadence');
const launchCadenceForLead = require('./launchForLead');
const createCadenceForUser = require('./createCadenceForUser');
const handleCadenceDelete = require('./handleCadenceDelete');
const launchCadence = require('./LaunchCadence');
const shareCadenceToCompany = require('./shareCadenceToCompany');
const shareCadenceToUsers = require('./shareCadenceToUsers');
const shareCadenceToGroups = require('./shareCadenceToGroups');
const {
  resumeCadenceForLead,
  stopCadenceForLead,
  pauseCadenceForLead,
  stopCadence,
  stopAllCadencesForLead,
} = require('./changeStatusForLead');
const {
  updateCadenceMemberStatusInSalesforce,
} = require('./updateCadenceMemberStatus');
const moveToCadence = require('./moveToCadence');
const getCadenceUsers = require('./getCadenceUsers');
const checkCadenceActionAccess = require('./checkCadenceAccess');
const createMockCadences = require('./createMockCadences');
const calculateLeadCadenceOrder = require('./calculateLeadCadenceOrder');
const pauseCadenceActivity = require('./pauseCadenceActivity');
const getCadencesOfLeads = require('./getCadencesOfLead');
const createProductTourCadence = require('./createProductTourCadence');
const getCadenceStepStatistics = require('./getCadenceStepStatistics');
const deleteAllCadenceInfo = require('./deleteAllCadenceInfo');
const launchCadenceByRawQuery = require('./launchCadenceByRawQuery');
const updateCadenceIntegrationTypeForSheetsIntegration = require('./updateCadenceIntegrationTypeForSheetsIntegration');
const launchCadenceManager = require('./launchCadenceManager');

const CadenceHelper = {
  addNodeToCadence,
  launchCadenceForLead,
  createCadenceForUser,
  launchCadence,
  resumeCadenceForLead,
  stopCadenceForLead,
  pauseCadenceForLead,
  updateCadenceMemberStatusInSalesforce,
  handleCadenceDelete,
  moveToCadence,
  getCadenceUsers,
  stopCadence,
  checkCadenceActionAccess,
  createMockCadences,
  calculateLeadCadenceOrder,
  pauseCadenceActivity,
  getCadencesOfLeads,
  shareCadenceToCompany,
  shareCadenceToUsers,
  shareCadenceToGroups,
  createProductTourCadence,
  getCadenceStepStatistics,
  deleteAllCadenceInfo,
  stopAllCadencesForLead,
  launchCadenceByRawQuery,
  updateCadenceIntegrationTypeForSheetsIntegration,
  launchCadenceManager,
};

module.exports = CadenceHelper;
