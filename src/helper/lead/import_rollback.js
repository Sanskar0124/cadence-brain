// * Util Imports
const { DB_TABLES } = require('../../utils/modelEnums');
const logger = require('../../utils/winston');

// * Repository Import
const Repository = require('../../repository');

const importRollback = async ({ account_id, lead_id }) => {
  try {
    if (account_id) {
      await Repository.destroy({
        tableName: DB_TABLES.ACCOUNT,
        query: {
          account_id,
        },
      });
    }

    if (lead_id) {
      await Repository.destroy({
        tableName: DB_TABLES.LEAD,
        query: {
          lead_id,
        },
      });

      await Repository.destroy({
        tableName: DB_TABLES.LEAD_PHONE_NUMBER,
        query: {
          lead_id,
        },
      });

      await Repository.destroy({
        tableName: DB_TABLES.LEAD_EMAIL,
        query: {
          lead_id,
        },
      });
    }

    return [true, null];
  } catch (err) {
    logger.error(
      `An error occurred while attempting to rollback import: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = importRollback;
