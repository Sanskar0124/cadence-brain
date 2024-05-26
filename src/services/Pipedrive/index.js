// *  Imports
const { createFilter, deleteFilter } = require('./lib/filter');
const { getAllPersons } = require('./lib/getAllPerson');
const addWebhookForObject = require('./lib/addWebhookForObject');
const deleteWebhookById = require('./lib/deleteWebhookById');
const addActivityType = require('./lib/addActivityType');
const createPerson = require('./lib/createPerson');
const createOrganization = require('./lib/createOrganization');
const searchPersons = require('./lib/searchPersons');
const searchOrganizations = require('./lib/searchOrganizations');
const fetchCustomViews = require('./lib/fetchCustomViews');

const PipedriveService = {
  createFilter,
  deleteFilter,
  getAllPersons,
  addWebhookForObject,
  deleteWebhookById,
  addActivityType,
  createPerson,
  createOrganization,
  searchPersons,
  searchOrganizations,
  fetchCustomViews,
};

module.exports = PipedriveService;
