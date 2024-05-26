const checkDuplicates = require('./checkDuplicates');
const formatForCreate = require('./formatForCreate');
const fetchValidEmails = require('./fetchValidEmails');
const { createEmails, createEmailUsingType } = require('./createEmails');
const {
  updateEmail,
  updateEmailUsingId,
  bulkUpsertEmails,
} = require('./updateEmail');

const leadEmailHelper = {
  checkDuplicates,
  formatForCreate,
  fetchValidEmails,
  createEmails,
  createEmailUsingType,
  updateEmail,
  updateEmailUsingId,
  bulkUpsertEmails,
};

module.exports = leadEmailHelper;
