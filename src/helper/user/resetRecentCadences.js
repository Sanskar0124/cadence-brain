// * Utils
const logger = require('../../utils/winston.js');
const { DB_TABLES } = require('../../utils/modelEnums.js');

// * Packages
const { Op } = require('sequelize');

// * Repositories
const Repository = require('../../repository');

// * Subtract days
Date.prototype.subtractDays = function (d) {
  this.setHours(this.getUTCHours() - d * 24);
  return this;
};

const resetRecentCadences = async () => {
  try {
    logger.info('Resetting recent cadences...');

    // * Generating timestamp 30 days old
    let thirtyDaysOldTimestamp = new Date();
    thirtyDaysOldTimestamp.subtractDays(30);
    thirtyDaysOldTimestamp = thirtyDaysOldTimestamp.getTime();

    // * Fetch all recent cadences older than 30 days
    let [recentCadenceEntriesToDelete, errFetchingRecentCadenceEntries] =
      await Repository.fetchAll({
        tableName: DB_TABLES.RECENT_ACTION,
        query: {
          updated_at: {
            [Op.lte]: thirtyDaysOldTimestamp,
          },
          cadence_id: {
            // * If in future Recent Actions is used to store other data, it should not be deleted. Only cadence related data should be reset.
            [Op.ne]: null,
          },
        },
        extras: {
          attributes: ['recent_action_id'],
        },
      });
    if (errFetchingRecentCadenceEntries) {
      logger.error(
        `Unable to get out-dated recent cadence entries: ${errFetchingRecentCadenceEntries}`
      );
      return [null, errFetchingRecentCadenceEntries];
    }

    // * Construct array
    let entriesToDelete = recentCadenceEntriesToDelete.map(
      (recentCadenceEntry) => recentCadenceEntry.recent_action_id
    );

    await Repository.destroy({
      tableName: DB_TABLES.RECENT_ACTION,
      query: {
        recent_action_id: {
          [Op.in]: entriesToDelete,
        },
      },
    });

    logger.info('Successfully reset recent cadences');
    return ['Successfully reset recent cadences', null];
  } catch (err) {
    logger.error(`Error while resetting recent cadences: `, err);
    return [null, err.message];
  }
};

module.exports = {
  resetRecentCadences,
};
