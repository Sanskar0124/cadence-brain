// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  REDIS_ADDED_USER_IDS_FOR_MAIL,
  REDIS_ADDED_USER_IDS_FOR_MESSAGE,
} = require('../../utils/constants');

// Repositories
const Repository = require('../../repository');

// Helpers and Services
const removeUsers = require('./removeUsers');

const removeSettingsUser = async (query) => {
  try {
    const [settings, errForSettings] = await Repository.fetchAll({
      tableName: DB_TABLES.SETTINGS,
      query,
    });
    if (errForSettings) return [null, errForSettings];

    let userIds = [];
    settings?.map((setting) => {
      if (setting?.user_id) userIds.push(setting?.user_id);
    });
    removeUsers(userIds, REDIS_ADDED_USER_IDS_FOR_MAIL);
    removeUsers(userIds, REDIS_ADDED_USER_IDS_FOR_MESSAGE);

    return ['Removed', null];
  } catch (err) {
    logger.error(`Error while removing settings user: `, err);
    return [null, err.message];
  }
};

module.exports = removeSettingsUser;
