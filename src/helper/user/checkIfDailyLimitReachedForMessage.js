// Utils
const logger = require('../../utils/winston');
const { SETTING_TYPES } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const Repository = require('../../repository');

// Helper and services
const getSettingsForUser = require('./getSettingsForUser');

const checkIfDailyLimitReachedForMessage = async (
  salesPerson,
  userTask,
  automatedTaskSettings
) => {
  try {
    // * fetch userTask
    if (!userTask) {
      const [fetchedUserTask, errForFetchedUserTask] =
        await Repository.fetchOne({
          tableName: DB_TABLES.USER_TASK,
          query: { user_id: salesPerson.user_id },
        });
      if (errForFetchedUserTask) return [null, errForFetchedUserTask];
      userTask = fetchedUserTask;
    }

    // * fetch automatedTaskSettings
    if (!automatedTaskSettings) {
      const [settings, errForSettings] = await getSettingsForUser({
        user_id: salesPerson.user_id,
        setting_type: SETTING_TYPES.AUTOMATED_TASK_SETTINGS,
      });
      if (errForSettings) return [null, errForSettings];
      automatedTaskSettings = settings.Automated_Task_Setting;
    }

    // * 'automated_mails_sent_per_day' exceeds 'max_emails_per_day' then dont send mail
    if (userTask && automatedTaskSettings) {
      if (
        userTask.automated_messages_sent_per_day >=
        automatedTaskSettings.max_sms_per_day
      ) {
        logger.info(
          `Automated message count per day exceeded for user ${salesPerson.first_name} ${salesPerson.last_name}.`
        );
        return [
          null,
          `Automated message count per day exceeded for user ${salesPerson.first_name} ${salesPerson.last_name}.`,
        ];
      }
    }
    logger.info(
      `Daily limit not reached yet for user ${salesPerson.first_name} ${salesPerson.last_name}.`
    );
    return [`Daily limit not reached yet.`, null];
  } catch (err) {
    logger.error(
      `Error while checking if daily limit reached for message: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = checkIfDailyLimitReachedForMessage;
