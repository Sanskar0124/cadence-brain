const getDelay = require('./getDelay');
const isTodayWorkingDay = require('./isTodayWorkingDay');
const getStartTimeForNextWorkingDay = require('./getStartTimeForNextWorkingDay');

const EmailSettingHelper = {
  getDelay,
  isTodayWorkingDay,
  getStartTimeForNextWorkingDay,
};

module.exports = EmailSettingHelper;
