// Utils
const logger = require('../../utils/winston');
const {
  CRM_INTEGRATIONS,
  LEAD_INTEGRATION_TYPES,
} = require('../../utils/enums');

const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

const getUserDetails = async (req) => {
  try {
    const [results, errForUser] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      include: {
        [DB_TABLES.COMPANY]: {
          where: {
            integration_id: req.portalId,
            integration_type: CRM_INTEGRATIONS.HUBSPOT,
          },
          required: true,
        },
        [DB_TABLES.LEAD]: {
          where: {
            integration_id: req.objectId,
            integration_type: LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT,
          },
          required: true,
        },
      },
    });

    if (!results || !results.Leads) {
      logger.info('Lead does not exist in cadence');
      return [null, 'Lead owner does not exist in cadence'];
    }

    const data = results.Leads[0];
    return [data, null];
  } catch (err) {
    logger.error(`Error while getting hubspot user details: `, err);
    return [null, err.message];
  }
};

module.exports = getUserDetails;
