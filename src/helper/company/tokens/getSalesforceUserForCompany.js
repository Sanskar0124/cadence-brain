// Utils
const { DB_TABLES } = require('../../../utils/modelEnums');
const logger = require('../../../utils/winston');

//Repository
const Repository = require('../../../repository');

const getSalesforceTokensForCompany = async ({ company_id }) => {
  try {
    let [companySettings, errFetchingTokens] = await Repository.fetchOne({
      tableName: DB_TABLES.COMPANY_SETTINGS,
      query: { company_id },
      include: {
        [DB_TABLES.USER]: {},
      },
      extras: {
        attributes: ['company_settings_id'],
      },
    });
    if (errFetchingTokens) return [null, errFetchingTokens];
    if (!companySettings) return [null, 'Company not found'];
    if (!companySettings.User)
      return [null, 'Please connect a salesforce account with the company'];

    return [companySettings?.User, null];
  } catch (err) {
    logger.error(
      'An error occurred in fetching salesforce tokens for company',
      err
    );
    return [null, err.message];
  }
};

module.exports = getSalesforceTokensForCompany;
