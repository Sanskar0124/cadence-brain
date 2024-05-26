const createTasksForLeads = require('./createTasksForLeads');
const { getTaskFilters, getTaskFiltersV2 } = require('./getTaskFilters');
const getTasksCountByType = require('./getTasksCountByType');
const getPendingTasks = require('./getPendingTasks');
const recalculateDailyTasksForCadenceUsers = require('./recalculateDailyTasksForCadenceUsers');
const recalculateDailyTasksForUsers = require('./recalculateDailyTasksForUsers');
const getPendingTasksV2 = require('./getPendingTasksV2');
const getTasksForDailyTasks = require('./getTasksForDailyTasks');
const recalculateDailyTasksForSdUsers = require('./recalculateDailyTasksForSdUsers');
const consumeTaskFromQueue = require('./conusmeTaskFromQueue');
const calculateDailyTasks = require('./calculateDailyTasks');
const checkIfTaskIsExecutable = require('./checkIfTaskIsExecutable');
const getCustomTaskDescription = require('./getCustomTaskDesciption');
const fetchTaskSummary = require('./fetchTaskSummary');
const findOrCreateTaskSummary = require('./findOrCreateTaskSummary');
const handleEndCadenceTask = require('./handleEndCadenceTask');
const updateLateTime = require('./updateLateTime');
const skipReplyTaskOwnerChange = require('./skipReplyTaskOwnerChange');
const createTasksForNotSubscribedAndNotBouncedLeads = require('./createTasksForNotSubscribedAndNotBouncedLeads');
const getStartTimeForTask = require('./getStartTimeForTask');

const TaskHelper = {
  createTasksForLeads,
  getTaskFilters,
  getTasksCountByType,
  getPendingTasks,
  recalculateDailyTasksForCadenceUsers,
  recalculateDailyTasksForUsers,
  getTaskFiltersV2,
  getPendingTasksV2,
  getTasksForDailyTasks,
  recalculateDailyTasksForSdUsers,
  consumeTaskFromQueue,
  calculateDailyTasks,
  checkIfTaskIsExecutable,
  getCustomTaskDescription,
  fetchTaskSummary,
  findOrCreateTaskSummary,
  handleEndCadenceTask,
  updateLateTime,
  skipReplyTaskOwnerChange,
  createTasksForNotSubscribedAndNotBouncedLeads,
  getStartTimeForTask,
};

module.exports = TaskHelper;
