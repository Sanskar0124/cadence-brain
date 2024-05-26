// Utils
const { DB_TABLES } = require('../../utils/modelEnums');
const logger = require('../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../utils/enums');

//Repository
const Repository = require('../../repository');

const getCrmIntegrationType = async (user_id, t) => {
  try {
    // * Fetch company integration type
    //old helper function to get integration type only of crm
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

    let crm_integration = user?.Company.integration_type;
    if (!Object.values(CRM_INTEGRATIONS).includes(crm_integration))
      return [null, 'Invalid CRM Integration. Please contact support'];

    return [crm_integration, null];
  } catch (err) {
    logger.error(
      `An error occurred while fetching company CRM integration: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = getCrmIntegrationType;
