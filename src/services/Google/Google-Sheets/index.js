const loadDocument = require('./loadDocument');
const getSheet = require('./getSheet');
const getFieldMapTemplate = require('./getFieldMapTemplate');
const reassignLeadsForGoogleSheets = require('./reassignLeadsForGoogleSheets');
const createLead = require('./createLead');
const batchUpdate = require('./batchUpdate');
const batchDelete = require('./batchDelete');

const GoogleSheets = {
  loadDocument,
  getSheet,
  getFieldMapTemplate,
  reassignLeadsForGoogleSheets,
  createLead,
  batchUpdate,
  batchDelete,
};

module.exports = GoogleSheets;
