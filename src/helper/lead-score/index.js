const updateLeadScore = require('./updateLeadScore');
const updateLeadScoreOnSettingsChange = require('./updateLeadScoreOnSettingsChange');
const cronResetLeadScore = require('./cronResetLeadScore');

const LeadScoreHelper = {
  updateLeadScore,
  updateLeadScoreOnSettingsChange,
  cronResetLeadScore,
};
module.exports = LeadScoreHelper;
