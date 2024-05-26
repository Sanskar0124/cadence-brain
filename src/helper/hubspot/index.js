const createContactCsv = require('./createContactCsv');
const createContactWebhook = require('./createContactWebhook');
const formatContactsForPreview = require('./formatContactsForPreview');
const getUsers = require('./getUsers');

const HubspotHelper = {
  createContactCsv,
  createContactWebhook,
  formatContactsForPreview,
  getUsers,
};

module.exports = HubspotHelper;
