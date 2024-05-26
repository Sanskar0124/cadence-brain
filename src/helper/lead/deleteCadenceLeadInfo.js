// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

/**
 *
 * @param {Array} leadIds
 * @param {String | Number} cadence_id
 */
const deleteCadenceLeadInfo = async (leadIds, cadence_id) => {
  try {
    // * delete all activities
    await Repository.destroy({
      tableName: DB_TABLES.ACTIVITY,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
        cadence_id,
      },
    });

    await Repository.destroy({
      tableName: DB_TABLES.EMAIL,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
        cadence_id,
      },
    });

    // * delete all tasks
    await Repository.destroy({
      tableName: DB_TABLES.TASK,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
        cadence_id,
      },
    });

    // * delete all LeadtoCadences
    await Repository.destroy({
      tableName: DB_TABLES.LEADTOCADENCE,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
        cadence_id,
      },
    });
    logger.info(`Deleted all leads info successfully.`);
    return ['Deleted all leads info successfully.', null];
  } catch (err) {
    logger.error(`Error while deleting all leads info: `, err);
    return [null, err.message];
  }
};

module.exports = deleteCadenceLeadInfo;
