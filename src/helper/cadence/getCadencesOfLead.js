//Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
//Repository
const Repository = require('../../repository');

//Packages
const { Op } = require('sequelize');

const getCadencesOfLeads = async ({ lead_ids }) => {
  try {
    const [cadences, errForCadences] = await Repository.fetchAll({
      tableName: DB_TABLES.CADENCE,
      query: {},
      include: {
        [DB_TABLES.LEADTOCADENCE]: {
          where: {
            lead_id: {
              [Op.in]: lead_ids,
            },
          },
          required: true,
        },
      },
    });
    if (errForCadences) return [null, errForCadences];
    return [cadences, null];
  } catch (err) {
    logger.error(`Error while fetching cadence for leads`, err);
    return [null, err.message];
  }
};

module.exports = getCadencesOfLeads;
