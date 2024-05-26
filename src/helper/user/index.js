const getMetricsForUser = require('./getMetricsForUser');
const getMonitoringForUser = require('./getMonitoringForUser');
const googleTokenForUser = require('./googleTokenForUser');
const handleUserDelete = require('./handleUserDelete');
const {
  getCurrentDateTimeForTimeZone,
  convertDateTimeToTimezone,
  convertToHour,
  addTimezoneOffset,
  setHoursForTimezone,
  workingDateNDaysFromNow,
  workingDateNDaysAgo,
  getTimezoneOffset,
} = require('./getDateForTimezone');
const deleteAllUserInfo = require('./deleteAllUserInfo');
const checkIfDailyLimitReachedForEmail = require('./checkIfDailyLimitReachedForEmail');
const checkIfDailyLimitReachedForMessage = require('./checkIfDailyLimitReachedForMessage');
const getSettingsForUser = require('./getSettingsForUser');
const createAvatar = require('./createAvatar');
const {
  checkIfUserIsAvailableForCallback,
} = require('./checkIfUserIsAvailableForCallback');
const deleteUserSession = require('./deleteUserSession');
const { resetRecentCadences } = require('./resetRecentCadences');
const removeInactiveSessions = require('./removeInactiveSessions');
const markProductTourAsCompleted = require('./markProductTourAsCompleted');

const UserHelper = {
  getMetricsForUser,
  getMonitoringForUser,
  googleTokenForUser,
  getCurrentDateTimeForTimeZone,
  convertDateTimeToTimezone,
  handleUserDelete,
  convertToHour,
  addTimezoneOffset,
  setHoursForTimezone,
  workingDateNDaysFromNow,
  workingDateNDaysAgo,
  deleteAllUserInfo,
  checkIfDailyLimitReachedForEmail,
  checkIfDailyLimitReachedForMessage,
  getSettingsForUser,
  createAvatar,
  getTimezoneOffset,
  checkIfUserIsAvailableForCallback,
  deleteUserSession,
  resetRecentCadences,
  removeInactiveSessions,
  markProductTourAsCompleted,
};

module.exports = UserHelper;
