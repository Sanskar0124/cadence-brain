//Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { sequelize } = require('../../db/models');

// Repository
const Repository = require('../../repository');

const cronResetAddonApiCalls = async () => {
  const t = await sequelize.transaction();
  try {
    const [, errForEnrichments] = await Repository.update({
      tableName: DB_TABLES.ENRICHMENTS,
      updateObject: {
        lusha_api_calls: 0,
        kaspr_api_calls: 0,
        hunter_api_calls: 0,
        dropcontact_api_calls: 0,
        snov_api_calls: 0,
      },
      query: {},
      t,
    });
    if (errForEnrichments)
      logger.error(
        `Error occurred while resetting addon api calls: ${errForEnrichments}`
      );
    else logger.info('Successfully reset addon api calls.');

    t.commit();
  } catch (err) {
    t.rollback();
    logger.error('Error while resetting addon api calls cron: ', err);
  }
};

module.exports = cronResetAddonApiCalls;
