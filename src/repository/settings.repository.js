// Utils
const logger = require('../utils/winston');
const { SETTING_TYPES } = require('../utils/enums');

// Models
const { Op } = require('sequelize');
const { User, Settings } = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const createSettings = async (setting) => {
  try {
    const newSetting = await Settings.create(setting);
    return [newSetting, null];
  } catch (err) {
    logger.error(`Error while creating settings: `, err);
    return [null, err];
  }
};

const updateSettings = async (query, setting) => {
  try {
    const settings = await Settings.update(setting, {
      where: query,
    });
    return [settings, null];
  } catch (err) {
    logger.error(`Error while updating settings: `, err);
    return [null, err.message];
  }
};

const updateSettingsByUserQuery = async (
  settings_query,
  user_query,
  setting_data,
  t
) => {
  try {
    let settingsToUpdate = await Settings.findAll({
      where: settings_query,
      include: [
        {
          model: User,
          where: user_query,
          attributes: [],
        },
      ],
      transaction: t,
    });
    settingsToUpdate = JsonHelper.parse(settingsToUpdate);

    for (let setting of settingsToUpdate) {
      const updatedSetting = await Settings.update(setting_data, {
        where: {
          settings_id: setting.settings_id,
        },
        transaction: t,
      });
    }
    return [settingsToUpdate, null];
  } catch (err) {
    logger.error(`Error while updating settings by user query: `, err);
    return [null, err.message];
  }
};

const getSettingsByUserQuery = async (query, user_query = {}) => {
  try {
    const settings = await Settings.findAll({
      where: query,
      include: [
        {
          model: User,
          where: user_query,
        },
      ],
    });
    return [JsonHelper.parse(settings), null];
  } catch (err) {
    logger.error(`Error while fetching user settings by user query: `, err);
    return [null, err.message];
  }
};

const SettingsRepository = {
  createSettings,
  updateSettings,
  updateSettingsByUserQuery,
  getSettingsByUserQuery,
};

module.exports = SettingsRepository;
