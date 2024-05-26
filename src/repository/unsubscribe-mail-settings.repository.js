// Utils
const logger = require('../utils/winston');

// Models
const { Unsubscribe_Mail_Settings } = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const getUnsubscribeMailSettings = async (query) => {
  try {
    const mailSettings = await Unsubscribe_Mail_Settings.findAll({
      where: query,
    });
    return [JsonHelper.parse(mailSettings), null];
  } catch (err) {
    logger.error(
      `Error while fetching unsubscribe mail settings: ${err.message}`
    );
    return [null, err.message];
  }
};

const getUnsubscribeMailSettingByQuery = async (query) => {
  try {
    const mailSettings = await Unsubscribe_Mail_Settings.findOne({
      where: query,
    });
    return [JsonHelper.parse(mailSettings), null];
  } catch (err) {
    logger.error(
      `Error while fetching unsubscribe mail setting: ${err.message}`
    );
    return [null, err.message];
  }
};

const createUnsubscribeMailSetting = async (mail_setting) => {
  try {
    const createdMailSetting = await Unsubscribe_Mail_Settings.create(
      mail_setting
    );
    return [JsonHelper.parse(createdMailSetting), null];
  } catch (err) {
    logger.error(
      `Error while adding unsubscribe mail settings: ${err.message}`
    );
    return [null, err.message];
  }
};

const bulkCreateUnsubscribeMailSettings = async (mail_settings) => {
  try {
    const createdMailSettings = await Unsubscribe_Mail_Settings.bulkCreate(
      mail_settings
    );
    return [JsonHelper.parse(createdMailSettings), null];
  } catch (err) {
    logger.error(
      `Error while creating bulk unsubscribe mail settings: ${err.message}`
    );
    return [null, err.message];
  }
};

const updateUnsubscribeMailSettings = async (query, mail_setting) => {
  try {
    const updatedMailSetting = await Unsubscribe_Mail_Settings.update(
      mail_setting,
      {
        where: query,
      }
    );
    return [JsonHelper.parse(updatedMailSetting), null];
  } catch (err) {
    logger.error(
      `Error while updating unsubscribe mail settings: ${err.message}`
    );
    return [null, err.message];
  }
};

const addOrUpdateUnsubscribeMailSettings = async (mail_setting) => {
  try {
    if (mail_setting.mail_settings_id) {
      const updatedMailSettings = await Unsubscribe_Mail_Settings.update(
        mail_setting,
        {
          where: {
            unsubscribe_settings_id: mail_setting.mail_settings_id,
          },
        }
      );
      return [updatedMailSettings, null];
    } else {
      const createdMailSetting = await Unsubscribe_Mail_Settings.create(
        mail_setting
      );
      return [JsonHelper.parse(createdMailSetting), null];
    }
  } catch (err) {
    logger.error(
      `Error while updating unsubscribe mail settings: ${err.message}`
    );
    return [null, err.message];
  }
};

const deleteUnsubscribeMailSettingsByQuery = async (query) => {
  try {
    const data = await Unsubscribe_Mail_Settings.destroy({
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(
      `Error while deleting unsubscribe mail setting query: ${err.message}.`
    );
    return [null, err.message];
  }
};
const UnsubscribeMailSettingsRepository = {
  getUnsubscribeMailSettings,
  createUnsubscribeMailSetting,
  bulkCreateUnsubscribeMailSettings,
  updateUnsubscribeMailSettings,
  addOrUpdateUnsubscribeMailSettings,
  getUnsubscribeMailSettingByQuery,
  deleteUnsubscribeMailSettingsByQuery,
};

module.exports = UnsubscribeMailSettingsRepository;
