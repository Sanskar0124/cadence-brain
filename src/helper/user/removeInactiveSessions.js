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

const removeInactiveSessions = async () => {
  try {
    logger.info('Removing inactive user sessions...');

    // * Generating timestamp 7 days old
    let sevenDaysOldTimestamp = new Date();
    sevenDaysOldTimestamp.subtractDays(7);
    sevenDaysOldTimestamp = sevenDaysOldTimestamp.getTime();

    Repository.destroy({
      tableName: DB_TABLES.RINGOVER_TOKENS,
      query: {
        updated_at: {
          [Op.lte]: sevenDaysOldTimestamp,
        },
      },
    });

    logger.info('Successfully removed inactive sessions');
    return ['Successfully removed inactive sessions', null];
  } catch (err) {
    logger.error(`Error while removing inactive sessions: `, err);
    return [null, err.message];
  }
};

module.exports = removeInactiveSessions;
