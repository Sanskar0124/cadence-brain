// Utils
const logger = require('../../utils/winston.js');
const { DB_TABLES } = require('../../utils/modelEnums');
const { SETTING_TYPES } = require('../../utils/enums');

// Repositories
const Repository = require('../../repository');

const getSettingsForUser = async ({ user_id, setting_type, t }) => {
  try {
    const [user, err] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: { user_id },
      t,
    });

    if (user === null) return [null, 'User does not exist.'];
    switch (setting_type) {
      case SETTING_TYPES.AUTOMATED_TASK_SETTINGS: {
        const [settings, errForSetting] = await Repository.fetchOne({
          tableName: DB_TABLES.SETTINGS,
          query: {
            user_id: user.user_id,
          },
          include: {
            [DB_TABLES.AUTOMATED_TASK_SETTINGS]: {},
          },
          t,
        });

        if (errForSetting) return [null, errForSetting];

        return [settings, null];
      }
      case SETTING_TYPES.BOUNCED_MAIL_SETTINGS: {
        const [settings, errForSetting] = await Repository.fetchOne({
          tableName: DB_TABLES.SETTINGS,
          query: {
            user_id: user.user_id,
          },
          include: {
            [DB_TABLES.BOUNCED_MAIL_SETTINGS]: {},
          },
          t,
        });
        if (errForSetting) return [null, errForSetting];

        return [settings, null];
      }
      case SETTING_TYPES.UNSUBSCRIBE_MAIL_SETTINGS: {
        const [settings, errForSetting] = await Repository.fetchOne({
          tableName: DB_TABLES.SETTINGS,
          query: {
            user_id: user.user_id,
          },
          include: {
            [DB_TABLES.UNSUBSCRIBE_MAIL_SETTINGS]: {},
          },
          t,
        });

        if (errForSetting) return [null, errForSetting];
        return [settings, null];
      }

      case SETTING_TYPES.TASK_SETTINGS: {
        const [settings, errForSetting] = await Repository.fetchOne({
          tableName: DB_TABLES.SETTINGS,
          query: {
            user_id: user.user_id,
          },
          include: {
            [DB_TABLES.TASK_SETTINGS]: {},
          },
          t,
        });
        if (errForSetting) return [null, errForSetting];
        return [settings, null];
      }

      case SETTING_TYPES.SKIP_SETTINGS: {
        const [settings, errForSetting] = await Repository.fetchOne({
          tableName: DB_TABLES.SETTINGS,
          query: {
            user_id: user.user_id,
          },
          include: {
            [DB_TABLES.SKIP_SETTINGS]: {},
          },
          t,
        });
        if (errForSetting) return [null, errForSetting];
        return [settings, null];
      }

      case SETTING_TYPES.LEAD_SCORE_SETTINGS: {
        const [settings, errForSetting] = await Repository.fetchOne({
          tableName: DB_TABLES.SETTINGS,
          query: {
            user_id: user.user_id,
          },
          include: {
            [DB_TABLES.LEAD_SCORE_SETTINGS]: {},
          },
          t,
        });
        if (errForSetting) return [null, errForSetting];
        return [settings, null];
      }
      default: {
        return [null, 'Invalid setting type.'];
      }
    }
  } catch (err) {
    logger.error(`Error while fetching user settings: `, err);
    return [null, err.message];
  }
};
// getSettingsForUser({
//   user_id: '3',
//   setting_type: 'task_settings',
// });
module.exports = getSettingsForUser;
