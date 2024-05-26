const createWebhook = require('./lib/createWebhook');
const deleteWebhookById = require('./lib/deleteWebhookById');
const updateWebhookById = require('./lib/updateWebhookById');
const { query } = require('./lib/query');
const fetchCustomViews = require('./lib/fetchCustomViews');
const fetchCustomViewById = require('./lib/fetchCustomViewById');
const fetchModuleByViewId = require('./lib/fetchModuleByViewId');

const createLead = require('./lib/createLead');
const searchAccount = require('./lib/searchAccount');
const createAccount = require('./lib/createAccount');
const updateAccount = require('./lib/updateAccount');
const createContact = require('./lib/createContact');





const ZohoService = {
  createWebhook,
  deleteWebhookById,
  updateWebhookById,
  query,
  fetchCustomViews,
  fetchCustomViewById,
  fetchModuleByViewId,
  createLead,
  searchAccount,
  createAccount,
  updateAccount,
  createContact,
};

module.exports = ZohoService;


