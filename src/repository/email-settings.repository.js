// Utils
const logger = require('../utils/winston');

// Models
const { Email_Settings } = require('../db/models');

// Helpers and Services
const JsonHelper = require('../helper/json');

const createEmailSettings = async (emailSettings) => {
  try {
    const createdEmailSettings = await Email_Settings.create(emailSettings);
    logger.info(
      'Created Email Settings: ' + JSON.stringify(createdEmailSettings, null, 4)
    );
    return [createdEmailSettings, null];
  } catch (err) {
    logger.error(`Error while creating email settings: ${err.message}.`);
    return [null, err.message];
  }
};

const updateEmailSettings = async (query, emailSettings) => {
  try {
    const data = await Email_Settings.update(emailSettings, {
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while updating email settings: ${err.message}.`);
    return [null, err.message];
  }
};

const getEmailSetting = async (query) => {
  try {
    // * fetch a email setting for given query
    const emailSetting = await Email_Settings.findOne({
      where: query,
    });

    return [JsonHelper.parse(emailSetting), null];
  } catch (err) {
    logger.error(`Error while fetching email setting: ${err.message}.`);
    return [null, err.message];
  }
};

const EmailSettingsRepository = {
  createEmailSettings,
  updateEmailSettings,
  getEmailSetting,
};

module.exports = EmailSettingsRepository;
