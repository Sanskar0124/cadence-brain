const { dateFilter, dateFilters } = require('./dateFilter');
const getDates = require('./getDates');
const roundToHour = require('./roundToHour');

const LeaderboardHelper = {
  dateFilter,
  dateFilters,
  getDates,
  roundToHour,
};

module.exports = LeaderboardHelper;
