// Utils
const logger = require('../../utils/winston');

// * Repository
const Repository = require('../../repository');
const { DB_TABLES } = require('../../utils/modelEnums');

const calculateLeadCadenceOrder = async (cadence_id) => {
  try {
    logger.info('Calculating lead cadence order...');

    const [leadToCadence, errFetchingLeadToCadence] = await Repository.fetchOne(
      {
        tableName: DB_TABLES.LEADTOCADENCE,
        query: {
          cadence_id,
        },
        extras: {
          order: [['created_at', 'desc']],
        },
      }
    );
    if (errFetchingLeadToCadence) return [null, errFetchingLeadToCadence];

    if (leadToCadence)
      return [parseInt(leadToCadence?.lead_cadence_order) + 1, null];
    return [1, null];
  } catch (err) {
    logger.error(`Error while calculating lead cadence order: `, err);
    return [null, err.message];
  }
};

module.exports = calculateLeadCadenceOrder;
