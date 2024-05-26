const query = require('./lib/query');
const createContact = require('./lib/createContact');
const createLead = require('./lib/createLead');
const createAccount = require('./lib/createAccount');
const updateAccount = require('./lib/updateAccount');
const associateContactWithAccount = require('./lib/associateContactWithAccount');

module.exports = {
  query,
  createContact,
  createLead,
  createAccount,
  updateAccount,
  associateContactWithAccount,
};
