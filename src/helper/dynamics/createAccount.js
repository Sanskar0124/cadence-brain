// Utils
const logger = require('../../utils/winston');
const { ACCOUNT_INTEGRATION_TYPES } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');
const { sequelize } = require('../../db/models');

// Repository
const Repository = require('../../repository');

// Helpers and Services
const getCompanySize = require('../company-field-map/getCompanySize');

const createAccount = async ({ user, account, account_map }) => {
  const t = await sequelize.transaction();
  try {
    const [newAccount, errForNewAccount] = await Repository.create({
      tableName: DB_TABLES.ACCOUNT,
      createObject: {
        name: account[account_map.name],
        size: account[
          `${
            getCompanySize({
              size: account_map.size,
            })[0]
          }`
        ],
        url: account[account_map.url],
        country: account[account_map.country],
        linkedin_url: account[account_map.linkedin_url],
        integration_type: ACCOUNT_INTEGRATION_TYPES.DYNAMICS_ACCOUNT,
        integration_id: account.accountid,
        zipcode: account[account_map.zipcode],
        phone_number: account[account_map.phone_number],
        user_id: user.user_id,
        company_id: user.company_id,
      },
      t,
    });
    if (errForNewAccount) {
      t.rollback();
      logger.error(
        'Error while fetching account in dynamics: ',
        errForNewAccount
      );
      [null, errForNewAccount];
    }

    t.commit();
    return [newAccount, null];
  } catch (err) {
    t.rollback();
    logger.error('An error occurred while create new account in db: ', err);
    return [null, err.message];
  }
};

module.exports = createAccount;
