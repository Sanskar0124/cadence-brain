const describeObject = require('./describeObject');
const getContact = require('./getContact');
const getLead = require('./getLead');
const getAccount = require('./getAccount');
const updateAccount = require('./updateAccount');
const updateContact = require('./updateContact');
const updateLead = require('./updateLead');
const getCandidate = require('./getCandidate');
const updateCandidate = require('./updateCandidate');
const createSmsActivity = require('./createSmsActivity');
const createNoteActivity = require('./createNoteActivity');
const createMailActivity = require('./createMailActivity');
const getDataFromWebhook = require('./getDataFromWebhook');
const deleteWebhook = require('./deleteWebhook');
const addWebhook = require('./addWebhook');
const createCalenderActivity = require('./createCalenderActivity');
const describePicklist = require('./describePicklist');
const getUser = require('./getUser');
const getAllResumeOfCandidate = require('./getAllResumeOfCandidate');
const parseResume = require('./parseResume');

module.exports = {
  describeObject,
  getContact,
  getLead,
  getAccount,
  updateAccount,
  updateContact,
  updateLead,
  getCandidate,
  updateCandidate,
  createSmsActivity,
  createNoteActivity,
  createMailActivity,
  addWebhook,
  deleteWebhook,
  getDataFromWebhook,
  createCalenderActivity,
  describePicklist,
  getUser,
  getAllResumeOfCandidate,
  parseResume,
};
