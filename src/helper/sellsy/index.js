const createContact = require('./createContact');
const describeContactFields = require('./describeContactFields');
const describeCompanyFields = require('./describeCompanyFields');
const describeUserFields = require('./describeUserFields');
const getFieldMapForCompany = require('./getFieldMapForCompany');
const {
  mapSellsyField,
  fieldToObjectMap,
  separateCustomAndDefaultFields,
} = require('./fieldMapper');
const companyFieldSchema = require('./companyFieldSchema');
const getCustomFields = require('./getCustomFields');
const parseCsv = require('./parseCsv');
const parseCsvColumn = require('./parseCsvColumn');

const SellsyHelper = {
  createContact,
  describeContactFields,
  describeCompanyFields,
  describeUserFields,
  getFieldMapForCompany,
  mapSellsyField,
  fieldToObjectMap,
  companyFieldSchema,
  separateCustomAndDefaultFields,
  getCustomFields,
  parseCsv,
  parseCsvColumn,
};

module.exports = SellsyHelper;
