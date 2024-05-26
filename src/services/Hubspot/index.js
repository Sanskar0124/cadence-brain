const searchCompany = require('./libs/searchCompany');
const createCompany = require('./libs/createCompany');
const createContact = require('./libs/createContact');
const updateCompany = require('./libs/updateCompany');
const fetchCustomViews = require('./libs/fetchCustomViews');

const HubspotService = {
  searchCompany,
  createCompany,
  createContact,
  updateCompany,
  fetchCustomViews,
};

module.exports = HubspotService;
