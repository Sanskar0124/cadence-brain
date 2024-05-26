// Utils
const logger = require('../utils/winston');

// Models
const { Automated_Task_Settings } = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const getAutomatedTaskSettings = async (query) => {
  try {
    const automatedTaskSettings = await Automated_Task_Settings.findAll({
      where: query,
    });
    return [JsonHelper.parse(automatedTaskSettings), null];
  } catch (err) {
    logger.error(
      `Error while fetching automated task settings: ${err.message}`
    );
    return [null, err.message];
  }
};

const getAutomatedTaskSettingByQuery = async (query) => {
  try {
    const automatedTaskSettings = await Automated_Task_Settings.findOne({
      where: query,
    });
    return [JsonHelper.parse(automatedTaskSettings), null];
  } catch (err) {
    logger.error(
      `Error while fetching automated task settings: ${err.message}`
    );
    return [null, err.message];
  }
};

const createAutomatedTaskSetting = async (automated_task_setting) => {
  try {
    const createdATSetting = await Automated_Task_Settings.create(
      automated_task_setting
    );
    return [JsonHelper.parse(createdATSetting), null];
  } catch (err) {
    logger.error(`Error while adding automated task settings: ${err.message}`);
    return [null, err.message];
  }
};

const bulkCreateAutomatedTaskSettings = async (automatedTaskSettings) => {
  try {
    const createdATSettings = await Automated_Task_Settings.bulkCreate(
      automatedTaskSettings
    );
    return [JsonHelper.parse(createdATSettings), null];
  } catch (err) {
    logger.error(
      `Error while creating bulk automated task settings: ${err.message}`
    );
    return [null, err.message];
  }
};

const updateAutomatedTaskSettings = async (query, automated_task_setting) => {
  try {
    const updatedATSettings = await Automated_Task_Settings.update(
      automated_task_setting,
      {
        where: query,
      }
    );
    return [updatedATSettings, null];
  } catch (err) {
    logger.error(
      `Error while updating automated task settings: ${err.message}`
    );
    return [null, err.message];
  }
};

const deleteAutomatedTaskSetting = async (query) => {
  try {
    const data = await Automated_Task_Settings.destroy({
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting automated task setting: ${err.message}`);
    return [null, err.message];
  }
};

const AutomatedTaskSettingsRepository = {
  getAutomatedTaskSettings,
  getAutomatedTaskSettingByQuery,
  createAutomatedTaskSetting,
  bulkCreateAutomatedTaskSettings,
  updateAutomatedTaskSettings,
  deleteAutomatedTaskSetting,
};

module.exports = AutomatedTaskSettingsRepository;
