// Utils
const { DB_TABLES } = require('../../utils/modelEnums');
const logger = require('../../utils/winston');

//Repository
const Repository = require('../../repository');

const getIntegrationType = async (user_id, t) => {
  try {
    // * Fetch company integration type of both crm and hiring
    let [user, errFetchingUser] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: {
        user_id,
      },
      extras: {
        attributes: ['first_name'],
      },
      include: {
        [DB_TABLES.COMPANY]: {
          attributes: ['name', 'integration_type'],
        },
      },
      t,
    });
    if (errFetchingUser) return [null, errFetchingUser];
    if (!user) return [null, 'Unable to fetch user'];

    let integration = user?.Company.integration_type;

    return [integration, null];
  } catch (err) {
    logger.error(
      `An error occurred while fetching company integration type: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = getIntegrationType;
