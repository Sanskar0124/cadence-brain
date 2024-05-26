// Utils
const logger = require('../utils/winston');

// Models
const { Bounced_Mail_Settings } = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const getBouncedMailSettings = async (query) => {
  try {
    const mailSettings = await Bounced_Mail_Settings.findAll({
      where: query,
    });
    return [JsonHelper.parse(mailSettings), null];
  } catch (err) {
    logger.error(`Error while fetching Bounced mail settings: ${err.message}`);
    return [null, err.message];
  }
};

const getBouncedMailSettingByQuery = async (query) => {
  try {
    const mailSettings = await Bounced_Mail_Settings.findOne({
      where: query,
    });
    return [JsonHelper.parse(mailSettings), null];
  } catch (err) {
    logger.error(`Error while fetching Bounced mail setting: ${err.message}`);
    return [null, err.message];
  }
};

const createBouncedMailSetting = async (mail_setting) => {
  try {
    const createdMailSetting = await Bounced_Mail_Settings.create(mail_setting);
    return [JsonHelper.parse(createdMailSetting), null];
  } catch (err) {
    logger.error(`Error while adding Bounced mail settings: ${err.message}`);
    return [null, err.message];
  }
};

const bulkCreateBouncedMailSettings = async (mail_settings) => {
  try {
    const createdMailSettings = await Bounced_Mail_Settings.bulkCreate(
      mail_settings
    );
    return [JsonHelper.parse(createdMailSettings), null];
  } catch (err) {
    logger.error(
      `Error while creating bulk Bounced mail settings: ${err.message}`
    );
    return [null, err.message];
  }
};

const updateBouncedMailSettings = async (query, mail_setting) => {
  try {
    const updatedMailSetting = await Bounced_Mail_Settings.update(
      mail_setting,
      {
        where: query,
      }
    );
    return [JsonHelper.parse(updatedMailSetting), null];
  } catch (err) {
    logger.error(`Error while updating Bounced mail settings: ${err.message}`);
    return [null, err.message];
  }
};

const addOrUpdateBouncedMailSettings = async (mail_setting) => {
  try {
    if (mail_setting.mail_settings_id) {
      const updatedMailSettings = await Bounced_Mail_Settings.update(
        mail_setting,
        {
          where: {
            Bounced_settings_id: mail_setting.mail_settings_id,
          },
        }
      );
      return [updatedMailSettings, null];
    } else {
      const createdMailSetting = await Bounced_Mail_Settings.create(
        mail_setting
      );
      return [JsonHelper.parse(createdMailSetting), null];
    }
  } catch (err) {
    logger.error(`Error while updating bounced mail settings: ${err.message}`);
    return [null, err.message];
  }
};
const deleteBouncedMailSettingsByQuery = async (query) => {
  try {
    const data = await Bounced_Mail_Settings.destroy({
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

const BouncedMailSettingsRepository = {
  getBouncedMailSettings,
  createBouncedMailSetting,
  bulkCreateBouncedMailSettings,
  updateBouncedMailSettings,
  addOrUpdateBouncedMailSettings,
  getBouncedMailSettingByQuery,
  deleteBouncedMailSettingsByQuery,
};

module.exports = BouncedMailSettingsRepository;
