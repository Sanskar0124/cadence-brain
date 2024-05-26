const getDelay = require('./getDelay');
const isTodayWorkingDay = require('./isTodayWorkingDay');
const getStartTimeForNextWorkingDay = require('./getStartTimeForNextWorkingDay');
const isInWorkingTime = require('./isInWorkingTime');

const AutomatedSettingsHelper = {
  getDelay,
  isTodayWorkingDay,
  getStartTimeForNextWorkingDay,
  isInWorkingTime,
};

module.exports = AutomatedSettingsHelper;
