const { query } = require('./lib/query');
const { search } = require('./lib/search');
const createWebhook = require('./lib/createWebhook');
const deleteWebhook = require('./lib/deleteWebhook');
const { exportEntity } = require('./lib/exportEntity');
const fetchSavedSearch = require('./lib/fetchSavedSearch');

const BullhornService = {
  query,
  search,
  createWebhook,
  deleteWebhook,
  exportEntity,
  fetchSavedSearch,
};

module.exports = BullhornService;
