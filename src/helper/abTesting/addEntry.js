// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const { sequelize } = require('../../db/models');
const Repository = require('../../repository');

const addEntry = async ({ node_id, message_id, ab_template_id }) => {
  const t = await sequelize.transaction();
  try {
    const [abTest, errForAbTesting] = await Repository.create({
      tableName: DB_TABLES.A_B_TESTING,
      createObject: {
        node_id,
        message_id,
        ab_template_id,
      },
      t,
    });
    if (errForAbTesting) {
      t.rollback();
      logger.error(`Error while creating ab test entry`, errForAbTesting);
      return [null, errForAbTesting.message];
    }
    t.commit();

    return [abTest, null];
  } catch (err) {
    t.rollback();
    logger.error(`Error while trying to create an ab testing entry: `, err);
    return [null, err.message];
  }
};

module.exports = addEntry;
