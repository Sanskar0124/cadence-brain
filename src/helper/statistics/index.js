const getMailTasksForHistoryGraph = require('./getMailTasksForHistoryGraph');
const getTasksForHistoryGraph = require('./getTasksForHistoryGraph');
const getPendingTasks = require('./getPendingTasks');
const getPendingTasksV2 = require('./getPendingTasksV2');
const getTasksForHistoryGraphV2 = require('./getTasksForHistoryGraphV2');
const getMailTasksForHistoryGraphV2 = require('./getMailTasksForHistoryGraphV2');
const recalculateStatisticsForUser = require('./recalculateStatisticsForUser');
const recalculateStatisticsForUserRoute = require('./recalculateStatisticsForUserRoute');
const getGroupByForTimeframe = require('./getGroupByForTimeframe');
const getStatusArrayForTable = require('./getStatusArrayForTable');
const getTaskArrayForTable = require('./getTaskArrayForTable');
const getPendingTasksArrayForTable = require('./getPendingTasksArrayForTable');

const StatisticsHelper = {
  getMailTasksForHistoryGraph,
  getTasksForHistoryGraph,
  getPendingTasks,
  getMailTasksForHistoryGraphV2,
  getTasksForHistoryGraphV2,
  getPendingTasksV2,
  recalculateStatisticsForUser,
  recalculateStatisticsForUserRoute,
  getGroupByForTimeframe,
  getStatusArrayForTable,
  getTaskArrayForTable,
  getPendingTasksArrayForTable,
};

module.exports = StatisticsHelper;
