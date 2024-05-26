// Utils
const logger = require('../utils/winston');

// Models
const { Task_Settings } = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const getTaskSettings = async (query) => {
  try {
    const taskSettings = await Task_Settings.findAll({
      where: query,
    });
    return [JsonHelper.parse(taskSettings), null];
  } catch (err) {
    logger.error(`Error while fetching task settings: `, err);
    return [null, err.message];
  }
};

const getTaskSettingByQuery = async (query) => {
  try {
    const taskSettings = await Task_Settings.findOne({
      where: query,
    });
    return [JsonHelper.parse(taskSettings), null];
  } catch (err) {
    logger.error(`Error while fetching task setting: `, err);
    return [null, err.message];
  }
};

const createTaskSetting = async (task_setting) => {
  try {
    const createdTaskSetting = await Task_Settings.create(task_setting);
    return [JsonHelper.parse(createdTaskSetting), null];
  } catch (err) {
    logger.error(`Error while adding task settings:`, err);
    return [null, err.message];
  }
};

const updateTaskSettings = async (query, task_setting) => {
  try {
    const updatedTaskSetting = await Task_Settings.update(task_setting, {
      where: query,
    });
    return [JsonHelper.parse(updatedTaskSetting), null];
  } catch (err) {
    logger.error(`Error while updating task settings: `, err);
    return [null, err.message];
  }
};

const deleteTaskSettingsByQuery = async (query) => {
  try {
    const data = await Task_Settings.destroy({
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting task settings by query: `, err);
    return [null, err.message];
  }
};
const TaskSettingsRepository = {
  getTaskSettings,
  getTaskSettingByQuery,
  createTaskSetting,
  updateTaskSettings,
  deleteTaskSettingsByQuery,
};

module.exports = TaskSettingsRepository;
