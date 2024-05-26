//Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repository
const Repository = require('../../repository');

// Packages
const { sequelize } = require('../../db/models');
const moment = require('moment-timezone');
const { Op } = require('sequelize');

const cronMonthlyResetUserApiCalls = async () => {
  const t = await sequelize.transaction();
  try {
    // Fetch all unique user timezones from the USER table.
    const [uniqueTimezones, errFetchingTimezones] = await Repository.fetchAll({
      tableName: DB_TABLES.USER,
      query: {},
      extras: {
        attributes: ['timezone'],
        group: ['timezone'],
      },
      t,
    });
    if (errFetchingTimezones) {
      t.rollback();
      return logger.error(
        `Error fetching unique timezones: ${errFetchingTimezones}`
      );
    }

    // Check which of these timezones are transitioning to the 1st of the month at or after 12:00 AM
    const matchingTimezones = uniqueTimezones
      // To avoid null and empty strings
      .filter(
        (obj) =>
          obj.timezone &&
          typeof obj.timezone === 'string' &&
          obj.timezone.trim() !== ''
      )
      .filter((obj) => {
        const localTime = moment.tz(obj.timezone);
        return (
          localTime.date() === 1 &&
          localTime.hour() === 0 &&
          localTime.minute() < 30
        );
      })
      .map((obj) => obj.timezone); // To get an array of string of timezone
    if (matchingTimezones.length > 0) {
      logger.info(
        `Timezones transitioning to the 1st of the month at 12:00 AM: ${matchingTimezones.join(
          ', '
        )}`
      );
    } else {
      t.rollback();
      return logger.info(
        'No timezones found that are transitioning to the 1st of the month at 12:00 AM 📆'
      );
    }

    // For those timezones, fetch all the users.
    const [usersWithMatchingTimezone, errFetchingUsers] =
      await Repository.fetchAll({
        tableName: DB_TABLES.USER,
        query: { timezone: { [Op.in]: matchingTimezones } },
        extras: {
          attributes: ['user_id', 'timezone'],
        },
        t,
      });
    if (errFetchingUsers) {
      t.rollback();
      return logger.error(
        `Error fetching users with matching timezones: ${errFetchingUsers}`
      );
    }
    const userIds = usersWithMatchingTimezone.map((user) => user.user_id);

    // Reset the API counts for those users
    const [, errWhileUpdatingAddonsApiCount] = await Repository.update({
      tableName: DB_TABLES.USER_TASK,
      updateObject: {
        lusha_calls_per_month: 0,
        kaspr_calls_per_month: 0,
        hunter_calls_per_month: 0,
        dropcontact_calls_per_month: 0,
        snov_calls_per_month: 0,
      },
      query: { user_id: { [Op.in]: userIds } },
      t,
    });
    if (errWhileUpdatingAddonsApiCount) {
      t.rollback();
      return logger.error(
        `Error occurred while resetting monthly addon api calls: ${errWhileUpdatingAddonsApiCount}`
      );
    }

    logger.info('Successfully reset monthly addon api calls!');
    t.commit();
  } catch (err) {
    t.rollback();
    logger.error('Error while resetting monthly addon api calls cron: ', err);
  }
};

module.exports = cronMonthlyResetUserApiCalls;
