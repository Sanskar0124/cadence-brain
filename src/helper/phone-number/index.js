const formatPhoneNumber = require('./formatPhoneNumber');
const getTimezoneFromNumber = require('./getTimezoneFromNumber');
const {
  updatePhoneNumber,
  updatePhoneNumberUsingId,
  bulkUpsertPhoneNumbers,
} = require('./updatePhoneNumber');
// const updatePhoneNumbers = require('./updatePhoneNumbers');
const formatForCreate = require('./formatForCreate');
const fetchPhoneNumbers = require('./fetchPhoneNumbers');
const seperatePhoneNumbers = require('./seperatePhoneNumbers');
const createPhoneNumber = require('./createPhoneNumber');

const phoneNumberHelper = {
  createPhoneNumber,
  formatPhoneNumber,
  getTimezoneFromNumber,
  updatePhoneNumber,
  bulkUpsertPhoneNumbers,
  // updatePhoneNumbers,
  updatePhoneNumberUsingId,
  formatForCreate,
  fetchPhoneNumbers,
  seperatePhoneNumbers,
};

module.exports = phoneNumberHelper;
