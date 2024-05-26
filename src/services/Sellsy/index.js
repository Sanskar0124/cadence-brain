const createWebhook = require('./lib/createWebhook');
const searchContacts = require('./lib/searchContacts');
const deleteWebhookById = require('./lib/deleteWebhookById');
const getAccountCustomFields = require('./lib/getAccount');
const {
  getContactCustomFields,
  getCompanyIdUsingContactId,
} = require('./lib/getContact');
const searchCompany = require('./lib/searchCompany');
const createCompany = require('./lib/createCompany');
const updateCompany = require('./lib/updateCompany');
const createContact = require('./lib/createContact');
const linkContact = require('./lib/linkContact');
const createCompanyAddress = require('./lib/createCompanyAddress');
const createSmartTags = require('./lib/createSmartTags');
const getThirdContact = require('./lib/getThirdContact');

const SellsyService = {
  createWebhook,
  searchContacts,
  deleteWebhookById,
  getAccountCustomFields,
  getContactCustomFields,
  getCompanyIdUsingContactId,
  searchCompany,
  createCompany,
  createContact,
  linkContact,
  createCompanyAddress,
  updateCompany,
  createSmartTags,
  getThirdContact,
};

module.exports = SellsyService;
