// * Imports
const {
  createExtensionFieldMap,
  updateAllExtensionFieldMap,
} = require('./createExtensionFieldMap');
const {
  getFieldMapForCompanyFromUser,
  getFieldMapForCompanyFromCompany,
} = require('./getFieldMapForCompany');

const ExtensionFieldMapHelper = {
  createExtensionFieldMap,
  updateAllExtensionFieldMap,
  getFieldMapForCompanyFromUser,
  getFieldMapForCompanyFromCompany,
};

module.exports = ExtensionFieldMapHelper;
