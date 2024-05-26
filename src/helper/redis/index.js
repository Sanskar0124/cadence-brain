const setValue = require('./create');
const getValue = require('./get');
const removeValue = require('./remove');
const removeCompanyUsers = require('./removeCompanyUsers');
const removeUsers = require('./removeUsers');
const appendValueToArray = require('./appendValueToArray');
const removeValueFromArray = require('./removeValueFromArray');
const setWithExpiry = require('./setWithExpiry');
const getTTL = require('./getTTL');
const removeSettingsUser = require('./removeSettingsUser');
const removeWithSuffix = require('./removeWithSuffix');
const setIfNotExists = require('./setIfNotExists');

const redisHelper = {
  setValue,
  getValue,
  removeValue,
  removeCompanyUsers,
  removeUsers,
  appendValueToArray,
  removeValueFromArray,
  setWithExpiry,
  getTTL,
  removeSettingsUser,
  removeWithSuffix,
  setIfNotExists,
};

module.exports = redisHelper;
