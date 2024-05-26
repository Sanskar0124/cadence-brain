// Utils
const logger = require('../../utils/winston');
const { SETTING_LEVELS } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repository
const Repository = require('../../repository');

const configureAutomatedSettings = async ({
  user,
  sd_id,
  automated_task_setting_priority,
  t,
}) => {
  try {
    if (automated_task_setting_priority === SETTING_LEVELS.USER) {
      const [fetchUserSettings, errFetchingUserSettings] =
        await Repository.fetchOne({
          tableName: DB_TABLES.AUTOMATED_TASK_SETTINGS,
          query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
          extras: {
            attributes: ['at_settings_id'],
          },
          t,
        });
      if (errFetchingUserSettings) {
        logger.error(
          `Error while fetching automated task settings: ${errFetchingUserSettings}`
        );
        return [
          null,
          `Error while fetching automated task settings: ${errFetchingUserSettings}`,
        ];
      }
      if (!fetchUserSettings) {
        logger.error('User excpetion for automated task settings not found');
        return [null, 'User excpetion for automated task settings not found'];
      }
      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.AUTOMATED_TASK_SETTINGS,
          query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
          updateObject: { sd_id },
          t,
        });
      if (errUpdatingUserSettings) {
        logger.error(
          `Error while updating user automated task settings: ${errUpdatingUserSettings}`
        );
        return [
          null,
          `Error while fetching automated user task settings: ${errUpdatingUserSettings}`,
        ];
      }
      logger.info('Updated user sd_id for at_settings');
      return ['Updated user sd_id for at_settings', null];
    }
    const [fetchSdAtSettings, errFetchingSdAtSettings] =
      await Repository.fetchOne({
        tableName: DB_TABLES.AUTOMATED_TASK_SETTINGS,
        query: { sd_id, priority: SETTING_LEVELS.SUB_DEPARTMENT },
        extras: {
          attributes: ['at_settings_id'],
        },
        t,
      });
    if (errFetchingSdAtSettings)
      return [
        null,
        `Error while fetching automated task settings: ${errFetchingSdAtSettings}`,
      ];

    if (fetchSdAtSettings?.at_settings_id) {
      let updateObject = { at_settings_id: fetchSdAtSettings.at_settings_id };
      if (automated_task_setting_priority === SETTING_LEVELS.ADMIN)
        updateObject['automated_task_setting_priority'] =
          SETTING_LEVELS.SUB_DEPARTMENT;
      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: updateObject,
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating user settings: ${errUpdatingUserSettings}`,
        ];
      logger.info('Updated sd at_settings_id');
      return ['Updated sd at_settings_id', null];
    } else if (
      automated_task_setting_priority === SETTING_LEVELS.SUB_DEPARTMENT
    ) {
      const [fetchCompanyAtSettings, errFetchingCompanyAtSettings] =
        await Repository.fetchOne({
          tableName: DB_TABLES.AUTOMATED_TASK_SETTINGS,
          query: {
            company_id: user.company_id,
            priority: SETTING_LEVELS.ADMIN,
          },
          extras: {
            attributes: ['at_settings_id'],
          },
          t,
        });
      if (errFetchingCompanyAtSettings)
        return [
          null,
          `Error while fetching automated task settings: ${errFetchingCompanyAtSettings}`,
        ];

      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: {
            automated_task_setting_priority: SETTING_LEVELS.ADMIN,
            at_settings_id: fetchCompanyAtSettings.at_settings_id,
          },
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating user settings: ${errUpdatingUserSettings}`,
        ];
      logger.info('Updated company at_settings_id');
      return ['Updated company at_settings_id', null];
    }
    logger.info('No change for at_settings_id');
    return ['No change for at_settings_id', null];
  } catch (err) {
    logger.info(`Error while configuring at_settings: ${err}`);
    return [null, `Error while configuring at_settings: ${err}`];
  }
};

const configureUnsubscribeTaskSettings = async ({
  user,
  sd_id,
  unsubscribe_setting_priority,
  t,
}) => {
  try {
    if (unsubscribe_setting_priority === SETTING_LEVELS.USER) {
      const [fetchUserSettings, errFetchingUserSettings] =
        await Repository.fetchOne({
          tableName: DB_TABLES.UNSUBSCRIBE_MAIL_SETTINGS,
          query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
          extras: {
            attributes: ['unsubscribe_settings_id'],
          },
          t,
        });
      if (errFetchingUserSettings) {
        logger.error(
          `Error while fetching unsubscribe settings: ${errFetchingUserSettings}`
        );
        return [
          null,
          `Error while fetching unsubscribe settings: ${errFetchingUserSettings}`,
        ];
      }
      if (!fetchUserSettings) {
        logger.error('User excpetion for unsubscribe settings not found');
        return [null, 'User excpetion for unsubscribe settings not found'];
      }
      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.UNSUBSCRIBE_MAIL_SETTINGS,
          query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
          updateObject: { sd_id },
          t,
        });
      if (errUpdatingUserSettings) {
        logger.error(
          `Error while updating user unsubscribe settings: ${errUpdatingUserSettings}`
        );
        return [
          null,
          `Error while fetching unsubscribe settings: ${errUpdatingUserSettings}`,
        ];
      }
      logger.info('Updated user sd_id for unsubscribe_settings');
      return ['Updated user sd_id for unsubscribe_settings', null];
    }
    const [fetchSdUnsubscribeSettings, errFetchingSdUnsubscribeSettings] =
      await Repository.fetchOne({
        tableName: DB_TABLES.UNSUBSCRIBE_MAIL_SETTINGS,
        query: { sd_id, priority: SETTING_LEVELS.SUB_DEPARTMENT },
        extras: {
          attributes: ['unsubscribe_settings_id'],
        },
        t,
      });
    if (errFetchingSdUnsubscribeSettings)
      return [
        null,
        `Error while fetching unsubscribe mail settings: ${errFetchingSdUnsubscribeSettings}`,
      ];

    if (fetchSdUnsubscribeSettings?.unsubscribe_settings_id) {
      let updateObject = {
        unsubscribe_settings_id:
          fetchSdUnsubscribeSettings.unsubscribe_settings_id,
      };
      if (unsubscribe_setting_priority === SETTING_LEVELS.ADMIN)
        updateObject['unsubscribe_setting_priority'] =
          SETTING_LEVELS.SUB_DEPARTMENT;
      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: updateObject,
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating user settings: ${errUpdatingUserSettings}`,
        ];
      logger.info('Updated sd unsubscribe_settings_id');
      return ['Updated sd unsubscribe_settings_id', null];
    } else if (unsubscribe_setting_priority === SETTING_LEVELS.SUB_DEPARTMENT) {
      const [
        fetchCompanyUnsubscribeSettings,
        errFetchingCompanyUnsubscribeSettings,
      ] = await Repository.fetchOne({
        tableName: DB_TABLES.UNSUBSCRIBE_MAIL_SETTINGS,
        query: { company_id: user.company_id, priority: SETTING_LEVELS.ADMIN },
        extras: {
          attributes: ['unsubscribe_settings_id'],
        },
        t,
      });
      if (errFetchingCompanyUnsubscribeSettings)
        return [
          null,
          `Error while fetching unsubscribe mail settings: ${errFetchingCompanyUnsubscribeSettings}`,
        ];

      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: {
            unsubscribe_setting_priority: SETTING_LEVELS.ADMIN,
            unsubscribe_settings_id:
              fetchCompanyUnsubscribeSettings.unsubscribe_settings_id,
          },
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating user settings: ${errUpdatingUserSettings}`,
        ];
      logger.info('Updated company unsubscribe_settings_id');
      return ['Updated company unsubscribe_settings_id', null];
    }
    logger.info('No change for unsubscribe_settings_id');
    return ['No change for unsubscribe_settings_id', null];
  } catch (err) {
    logger.info(`Error while configuring unsubscribe_settings: ${err}`);
    return [null, `Error while configuring unsubscribe_settings: ${err}`];
  }
};

const configureBouncedMailSettings = async ({
  user,
  sd_id,
  bounced_setting_priority,
  t,
}) => {
  try {
    if (bounced_setting_priority === SETTING_LEVELS.USER) {
      const [fetchUserSettings, errFetchingUserSettings] =
        await Repository.fetchOne({
          tableName: DB_TABLES.BOUNCED_MAIL_SETTINGS,
          query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
          extras: {
            attributes: ['bounced_settings_id'],
          },
          t,
        });
      if (errFetchingUserSettings) {
        logger.error(
          `Error while fetching bounced mail settings: ${errFetchingUserSettings}`
        );
        return [
          null,
          `Error while fetching bounced mail settings: ${errFetchingUserSettings}`,
        ];
      }
      if (!fetchUserSettings) {
        logger.error('User excpetion for bounced mail settings not found');
        return [null, 'User excpetion for bounced mail settings not found'];
      }
      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.BOUNCED_MAIL_SETTINGS,
          query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
          updateObject: { sd_id },
          t,
        });
      if (errUpdatingUserSettings) {
        logger.error(
          `Error while updating user bounced mail settings: ${errUpdatingUserSettings}`
        );
        return [
          null,
          `Error while fetching bounced mail settings: ${errUpdatingUserSettings}`,
        ];
      }
      logger.info('Updated user sd_id for bounced_settings');
      return ['Updated user sd_id for bounced_settings', null];
    }
    const [fetchSdBouncedMailSettings, errFetchingSdBouncedMailSettings] =
      await Repository.fetchOne({
        tableName: DB_TABLES.BOUNCED_MAIL_SETTINGS,
        query: { sd_id, priority: SETTING_LEVELS.SUB_DEPARTMENT },
        extras: {
          attributes: ['bounced_settings_id'],
        },
        t,
      });
    if (errFetchingSdBouncedMailSettings)
      return [
        null,
        `Error while fetching automated task settings: ${errFetchingSdBouncedMailSettings}`,
      ];

    if (fetchSdBouncedMailSettings?.bounced_settings_id) {
      let updateObject = {
        bounced_settings_id: fetchSdBouncedMailSettings.bounced_settings_id,
      };
      if (bounced_setting_priority === SETTING_LEVELS.ADMIN)
        updateObject['bounced_setting_priority'] =
          SETTING_LEVELS.SUB_DEPARTMENT;
      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: updateObject,
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating user settings: ${errUpdatingUserSettings}`,
        ];
      logger.info('Updated sd bounced_settings_id');
      return ['Updated sd bounced_settings_id', null];
    } else if (bounced_setting_priority === SETTING_LEVELS.SUB_DEPARTMENT) {
      const [
        fetchCompanyBouncedMailSettings,
        errFetchingCompanyBouncedMailSettings,
      ] = await Repository.fetchOne({
        tableName: DB_TABLES.BOUNCED_MAIL_SETTINGS,
        query: { company_id: user.company_id, priority: SETTING_LEVELS.ADMIN },
        extras: {
          attributes: ['bounced_settings_id'],
        },
        t,
      });
      if (errFetchingCompanyBouncedMailSettings)
        return [
          null,
          `Error while fetching bounced mail settings: ${errFetchingCompanyBouncedMailSettings}`,
        ];

      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: {
            bounced_setting_priority: SETTING_LEVELS.ADMIN,
            bounced_settings_id:
              fetchCompanyBouncedMailSettings.bounced_settings_id,
          },
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating user settings: ${errUpdatingUserSettings}`,
        ];

      logger.info('Updated company bounced_settings_id');
      return ['Updated company bounced_settings_id', null];
    }
    logger.info('No change for bounced_settings_id');
    return ['No change for bounced_settings_id', null];
  } catch (err) {
    logger.info(`Error while configuring bounced_settings: ${err}`);
    return [null, `Error while configuring bounced_settings: ${err}`];
  }
};

const configureSkipSettings = async ({
  user,
  sd_id,
  skip_setting_priority,
  t,
}) => {
  if (skip_setting_priority === SETTING_LEVELS.USER) {
    const [fetchUserSettings, errFetchingUserSettings] =
      await Repository.fetchOne({
        tableName: DB_TABLES.SKIP_SETTINGS,
        query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
        extras: {
          attributes: ['skip_settings_id'],
        },
        t,
      });
    if (errFetchingUserSettings) {
      logger.error(
        `Error while fetching skip settings: ${errFetchingUserSettings}`
      );
      return [
        null,
        `Error while fetching skip settings: ${errFetchingUserSettings}`,
      ];
    }
    if (!fetchUserSettings) {
      logger.error('User excpetion for skip settings not found');
      return [null, 'User excpetion for skip settings not found'];
    }
    const [updateUserSettings, errUpdatingUserSettings] =
      await Repository.update({
        tableName: DB_TABLES.SKIP_SETTINGS,
        query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
        updateObject: { sd_id },
        t,
      });
    if (errUpdatingUserSettings) {
      logger.error(
        `Error while updating user skip settings: ${errUpdatingUserSettings}`
      );
      return [
        null,
        `Error while updating skip settings: ${errUpdatingUserSettings}`,
      ];
    }
    logger.info('Updated user sd_id for skip_settings');
    return ['Updated user sd_id for skip_settings', null];
  }
  try {
    const [fetchSdSkipSettings, errFetchingSdSkipSettings] =
      await Repository.fetchOne({
        tableName: DB_TABLES.SKIP_SETTINGS,
        query: { sd_id, priority: SETTING_LEVELS.SUB_DEPARTMENT },
        extras: {
          attributes: ['skip_settings_id'],
        },
        t,
      });
    if (errFetchingSdSkipSettings)
      return [
        null,
        `Error while fetching skip settings: ${errFetchingSdSkipSettings}`,
      ];

    if (fetchSdSkipSettings?.skip_settings_id) {
      let updateObject = {
        skip_settings_id: fetchSdSkipSettings.skip_settings_id,
      };
      if (skip_setting_priority === SETTING_LEVELS.ADMIN)
        updateObject['skip_setting_priority'] = SETTING_LEVELS.SUB_DEPARTMENT;
      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: updateObject,
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating skip settings: ${errUpdatingUserSettings}`,
        ];
      logger.info('Updated sd skip_settings_id');
      return ['Updated sd skip_settings_id', null];
    } else if (skip_setting_priority === SETTING_LEVELS.SUB_DEPARTMENT) {
      const [fetchCompanySkipSettings, errFetchingCompanySkipSettings] =
        await Repository.fetchOne({
          tableName: DB_TABLES.SKIP_SETTINGS,
          query: {
            company_id: user.company_id,
            priority: SETTING_LEVELS.ADMIN,
          },
          extras: {
            attributes: ['skip_settings_id'],
          },
          t,
        });
      if (errFetchingCompanySkipSettings)
        return [
          null,
          `Error while fetching skip task: ${errFetchingCompanySkipSettings}`,
        ];

      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: {
            skip_setting_priority: SETTING_LEVELS.ADMIN,
            skip_settings_id: fetchCompanySkipSettings.skip_settings_id,
          },
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating skip settings: ${errUpdatingUserSettings}`,
        ];

      logger.info('Updated company skip_settings_id');
      return ['Updated company skip_settings_id', null];
    }
    logger.info('No change for skip_settings_id');
    return ['No change for skip_settings_id', null];
  } catch (err) {
    logger.info(`Error while configuring skip_settings: ${err}`);
    return [null, `Error while configuring skip_settings: ${err}`];
  }
};

const configureLeadScoreSettings = async ({
  user,
  sd_id,
  ls_setting_priority,
  t,
}) => {
  try {
    if (ls_setting_priority === SETTING_LEVELS.USER) {
      const [fetchUserSettings, errFetchingUserSettings] =
        await Repository.fetchOne({
          tableName: DB_TABLES.LEAD_SCORE_SETTINGS,
          query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
          extras: {
            attributes: ['ls_settings_id'],
          },
          t,
        });
      if (errFetchingUserSettings) {
        logger.error(
          `Error while fetching lead score settings: ${errFetchingUserSettings}`
        );
        return [
          null,
          `Error while fetching lead score settings: ${errFetchingUserSettings}`,
        ];
      }
      if (!fetchUserSettings) {
        logger.error('User excpetion for lead score settings not found');
        return [null, 'User excpetion for lead score settings not found'];
      }
      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.LEAD_SCORE_SETTINGS,
          query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
          updateObject: { sd_id },
          t,
        });
      if (errUpdatingUserSettings) {
        logger.error(
          `Error while updating lead score settings: ${errUpdatingUserSettings}`
        );
        return [
          null,
          `Error while updating lead score settings: ${errUpdatingUserSettings}`,
        ];
      }
      logger.info('Updated user sd_id for ls_settings');
      return ['Updated user sd_id for ls_settings', null];
    }
    const [fetchSdLsSettings, errFetchingSdLsSettings] =
      await Repository.fetchOne({
        tableName: DB_TABLES.LEAD_SCORE_SETTINGS,
        query: { sd_id, priority: SETTING_LEVELS.SUB_DEPARTMENT },
        extras: {
          attributes: ['ls_settings_id'],
        },
        t,
      });
    if (errFetchingSdLsSettings)
      return [
        null,
        `Error while fetching lead score settings: ${errFetchingSdLsSettings}`,
      ];

    if (fetchSdLsSettings?.ls_settings_id) {
      let updateObject = {
        ls_settings_id: fetchSdLsSettings.ls_settings_id,
      };
      if (ls_setting_priority === SETTING_LEVELS.ADMIN)
        updateObject['ls_setting_priority'] = SETTING_LEVELS.SUB_DEPARTMENT;
      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: updateObject,
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating lead score settings: ${errUpdatingUserSettings}`,
        ];
      logger.info('Updated sd ls_settings_id');
      return ['Updated sd ls_settings_id', null];
    } else if (ls_setting_priority === SETTING_LEVELS.SUB_DEPARTMENT) {
      const [fetchCompanyLsSettings, errFetchingCompanyLsSettings] =
        await Repository.fetchOne({
          tableName: DB_TABLES.LEAD_SCORE_SETTINGS,
          query: {
            company_id: user.company_id,
            priority: SETTING_LEVELS.ADMIN,
          },
          extras: {
            attributes: ['ls_settings_id'],
          },
          t,
        });
      if (errFetchingCompanyLsSettings)
        return [
          null,
          `Error while fetching lead score task: ${errFetchingCompanyLsSettings}`,
        ];

      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: {
            ls_setting_priority: SETTING_LEVELS.ADMIN,
            ls_settings_id: fetchCompanyLsSettings.ls_settings_id,
          },
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating lead score settings: ${errUpdatingUserSettings}`,
        ];

      logger.info('Updated company ls_settings_id');
      return ['Updated company ls_settings_id', null];
    }
    logger.info('No change for ls_settings_id');
    return ['No change for ls_settings_id', null];
  } catch (err) {
    logger.info(`Error while configuring ls_settings: ${err}`);
    return [null, `Error while configuring ls_settings: ${err}`];
  }
};

const configureTaskSettings = async ({
  user,
  sd_id,
  task_setting_priority,
  t,
}) => {
  try {
    if (task_setting_priority === SETTING_LEVELS.USER) {
      const [fetchUserSettings, errFetchingUserSettings] =
        await Repository.fetchOne({
          tableName: DB_TABLES.TASK_SETTINGS,
          query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
          extras: {
            attributes: ['task_settings_id'],
          },
          t,
        });
      if (errFetchingUserSettings) {
        logger.error(
          `Error while fetching task settings: ${errFetchingUserSettings}`
        );
        return [
          null,
          `Error while fetching task settings: ${errFetchingUserSettings}`,
        ];
      }
      if (!fetchUserSettings) {
        logger.error('User excpetion for task settings not found');
        return [null, 'User excpetion for task settings not found'];
      }
      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.TASK_SETTINGS,
          query: { user_id: user.user_id, priority: SETTING_LEVELS.USER },
          updateObject: { sd_id },
          t,
        });
      if (errUpdatingUserSettings) {
        logger.error(
          `Error while updating task settings: ${errUpdatingUserSettings}`
        );
        return [
          null,
          `Error while updating task settings: ${errUpdatingUserSettings}`,
        ];
      }
      logger.info('Updated user sd_id for task_settings');
      return ['Updated user sd_id for task_settings', null];
    }
    const [fetchSdTaskSettings, errFetchingSdTaskSettings] =
      await Repository.fetchOne({
        tableName: DB_TABLES.TASK_SETTINGS,
        query: { sd_id, priority: SETTING_LEVELS.SUB_DEPARTMENT },
        extras: {
          attributes: ['task_settings_id'],
        },
        t,
      });
    if (errFetchingSdTaskSettings)
      return [
        null,
        `Error while fetching task settings: ${errFetchingSdTaskSettings}`,
      ];

    if (fetchSdTaskSettings?.task_settings_id) {
      let updateObject = {
        task_settings_id: fetchSdTaskSettings.task_settings_id,
      };
      if (task_setting_priority === SETTING_LEVELS.ADMIN)
        updateObject['task_setting_priority'] = SETTING_LEVELS.SUB_DEPARTMENT;
      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: updateObject,
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating task settings: ${errUpdatingUserSettings}`,
        ];
      logger.info('Updated sd task_settings_id');
      return ['Updated sd task_settings_id', null];
    } else if (task_setting_priority === SETTING_LEVELS.SUB_DEPARTMENT) {
      const [fetchCompanyTaskSettings, errFetchingCompanyTaskSettings] =
        await Repository.fetchOne({
          tableName: DB_TABLES.TASK_SETTINGS,
          query: {
            company_id: user.company_id,
            priority: SETTING_LEVELS.ADMIN,
          },
          extras: {
            attributes: ['task_settings_id'],
          },
          t,
        });
      if (errFetchingCompanyTaskSettings)
        return [
          null,
          `Error while fetching task settings: ${errFetchingCompanyTaskSettings}`,
        ];

      const [updateUserSettings, errUpdatingUserSettings] =
        await Repository.update({
          tableName: DB_TABLES.SETTINGS,
          query: { user_id: user.user_id },
          updateObject: {
            task_setting_priority: SETTING_LEVELS.ADMIN,
            task_settings_id: fetchCompanyTaskSettings.task_settings_id,
          },
          t,
        });
      if (errUpdatingUserSettings)
        return [
          null,
          `Error while updating task settings: ${errUpdatingUserSettings}`,
        ];
      logger.info('Updated company task_settings_id');
      return ['Updated company task_settings_id', null];
    }

    logger.info('No change for task_settings_id');
    return ['No change for task_settings_id', null];
  } catch (err) {
    logger.info(`Error while configuring task_settings: ${err}`);
    return [null, `Error while configuring task_settings: ${err}`];
  }
};

const reconfigureUserSettingsAfterTeamChange = async ({ user, sd_id, t }) => {
  try {
    const [userSettings, errFetchingUserSettings] = await Repository.fetchOne({
      tableName: DB_TABLES.SETTINGS,
      query: { user_id: user.user_id },
      t,
    });
    if (!userSettings) return [null, `No settings found for user`];
    if (errFetchingUserSettings)
      return [
        null,
        `Error while fetching user settings: ${errFetchingUserSettings}`,
      ];

    let promiseArray = [
      // Automated task settings
      configureAutomatedSettings({
        user,
        sd_id,
        automated_task_setting_priority:
          userSettings.automated_task_setting_priority,
        t,
      }),

      // Unsubscribe task settings
      configureUnsubscribeTaskSettings({
        user,
        sd_id,
        unsubscribe_setting_priority: userSettings.unsubscribe_setting_priority,
        t,
      }),

      // Bounced mail setting
      configureBouncedMailSettings({
        user,
        sd_id,
        bounced_setting_priority: userSettings.bounced_setting_priority,
        t,
      }),

      // Skip settings
      configureSkipSettings({
        user,
        sd_id,
        skip_setting_priority: userSettings.skip_setting_priority,
        t,
      }),

      // Lead score settings
      configureLeadScoreSettings({
        user,
        sd_id,
        ls_setting_priority: userSettings.ls_setting_priority,
        t,
      }),

      // Task settings
      configureTaskSettings({
        user,
        sd_id,
        task_setting_priority: userSettings.task_setting_priority,
        t,
      }),
    ];

    // resolve all promises
    let results = await Promise.all(promiseArray);
    // loop through all results
    for (let r of results) {
      // destructure result
      let [data, err] = r;
      if (err) {
        logger.error(`Error while configuring settinsg: ${err}`);
        return [null, err];
      }
    }

    logger.info('Successfully reconfigures users settings');
    return ['Successfully reconfigures users settings', null];
  } catch (err) {
    logger.error('Error while reconfiguting users settings: ', err);
    return [null, err.message];
  }
};

module.exports = reconfigureUserSettingsAfterTeamChange;
