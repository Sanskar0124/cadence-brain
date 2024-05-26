// * Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// * Helper Imports
const AccessTokenHelper = require('../access-token');
const CompanyFieldMapHelper = require('../company-field-map');

// * Repository Imports
const Repository = require('../../repository');

const getUser = async ({ user_integration_id, company_id, fetchedUserMap }) => {
  try {
    let user = {};
    let userErr;

    if (fetchedUserMap[user_integration_id])
      user = fetchedUserMap[user_integration_id];
    else {
      [user, userErr] = await Repository.fetchOne({
        tableName: DB_TABLES.USER,
        query: {
          integration_id: user_integration_id,
          company_id,
        },
        include: {
          [DB_TABLES.SUB_DEPARTMENT]: {
            attributes: ['name'],
          },
        },
        extras: {
          attributes: [
            'user_id',
            'sd_id',
            'company_id',
            'integration_id',
            'integration_type',
            'first_name',
            'last_name',
            'role',
          ],
        },
      });
      fetchedUserMap[user_integration_id] = user;
    }
    if (!user) return [null, 'Owner not present in our tool'];
    if (userErr) return [null, userErr];

    return [user, null];
  } catch (err) {
    logger.error('An error occurred while fetching user for import: ', err);
    return [null, err.message];
  }
};

module.exports = getUser;
