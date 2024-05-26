// * Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// * Helper Imports
const AccessTokenHelper = require('../access-token');
const CompanyFieldMapHelper = require('../company-field-map');

// * Repository Imports
const Repository = require('../../repository');

const preImportData = async ({ user_id, cadence_id, integration_type }) => {
  try {
    let preResults = await Promise.all([
      AccessTokenHelper.getAccessToken({
        integration_type,
        user_id,
      }),
      CompanyFieldMapHelper.getFieldMapForCompanyFromUser({ user_id }),
      Repository.fetchOne({
        tableName: DB_TABLES.CADENCE,
        query: { cadence_id },
        include: {
          [DB_TABLES.NODE]: {
            where: {
              cadence_id,
              is_first: 1,
            },
            required: false,
          },
          [DB_TABLES.SUB_DEPARTMENT]: {
            attributes: ['name'],
          },
          [DB_TABLES.USER]: {
            attributes: ['first_name', 'last_name'],
          },
        },
      }),
    ]);

    // * Fetching access_token and instance_url
    const [{ access_token, instance_url }, errForAccessToken] = preResults[0];
    // Check if salesforce is connected
    if (!access_token) return [{}, `Please connect to ${integration_type}`];

    // * Fetch salesforce field map
    let [companyFieldMap, errFetchingCompanyFieldMap] = preResults[1];
    if (errFetchingCompanyFieldMap) return [{}, errFetchingCompanyFieldMap];

    // * Cadence
    let [cadence, errFetchingCadence] = preResults[2];
    if (errFetchingCadence) return [{}, errFetchingCadence];
    if (!cadence) return [{}, 'Cadence does not exist'];

    let node = cadence.Nodes?.[0];

    // * Store cadence in Recent cadences
    if (cadence?.cadence_id)
      Repository.upsert({
        tableName: DB_TABLES.RECENT_ACTION,
        upsertObject: {
          user_id,
          cadence_id: cadence?.cadence_id,
        },
      });

    return [
      {
        access_token,
        instance_url,
        companyFieldMap,
        cadence,
        node,
      },
      null,
    ];
  } catch (err) {
    logger.error('An error occurred while fetching pre-import data: ', err);
    return [null, err.message];
  }
};

module.exports = preImportData;
