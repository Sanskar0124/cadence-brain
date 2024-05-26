// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const Repository = require('../../repository');

const deleteAllUserInfo = async (user_id, t) => {
  try {
    let data = '',
      err = '';

    // * delete user
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.USER,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // * delete from user_token
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.USER_TOKEN,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // * delete from user_task
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.USER_TASK,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // * delete from calendar settings
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.CALENDAR_SETTINGS,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // * delete email-templates
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.EMAIL_TEMPLATE,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // * delete message-templates
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.MESSAGE_TEMPLATE,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // * delete signatures
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.SIGNATURE,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // delete task settings
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.TASK_SETTINGS,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // delete skip task settings
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.SKIP_SETTINGS,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // delete unsubscribe settings
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.UNSUBSCRIBE_MAIL_SETTINGS,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // delete automated task settings
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.AUTOMATED_TASK_SETTINGS,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // delete settings
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.SETTINGS,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // delete bounce settings
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.BOUNCED_MAIL_SETTINGS,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    // delete lead score settings
    [data, err] = await Repository.destroy({
      tableName: DB_TABLES.LEAD_SCORE_SETTINGS,
      t,
      query: { user_id },
    });
    if (err) return [null, err];

    logger.info(`Deleted all user info for ${user_id}.`);
    return ['Deleted all user info.', null];
  } catch (err) {
    logger.error(`Error while deleting all user info: `, err);
    return [null, err.message];
  }
};

module.exports = deleteAllUserInfo;
