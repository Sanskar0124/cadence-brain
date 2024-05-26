const convertWorkingDaysEnumsToNumbersArray = require('./convertWorkingDaysEnumsToNumbersArray');
const convertWorkingDaysNumbersToEnumsArray = require('./convertWorkingDaysNumbersToEnumsArray');
const reconfigureUserSettingsAfterTeamChange = require('./reconfigureUserSettingsAfterTeamChange');

const SettingsHelpers = {
  convertWorkingDaysEnumsToNumbersArray,
  convertWorkingDaysNumbersToEnumsArray,
  reconfigureUserSettingsAfterTeamChange,
};

module.exports = SettingsHelpers;
