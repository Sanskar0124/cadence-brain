// * Imports
const {
  createCompanyFieldMap,
  createAllCompanyFieldMap,
} = require('./createCompanyFieldMap');
const {
  getFieldMapForCompanyFromUser,
  getFieldMapForCompanyFromCompany,
} = require('./getFieldMapForCompany');
const { createCompanyCustomObject } = require('./createCustomObject');
const { testCustomObject } = require('./testCustomObject');
const getCompanySize = require('./getCompanySize');

const CompanyFieldMapHelper = {
  createAllCompanyFieldMap,
  createCompanyFieldMap,
  getFieldMapForCompanyFromUser,
  getFieldMapForCompanyFromCompany,
  createCompanyCustomObject,
  testCustomObject,
  getCompanySize,
};

module.exports = CompanyFieldMapHelper;
