// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repository
const Repository = require('../../repository');

const getFieldMapForCompany = async (company_id) => {
  try {
    // * Fetch sellsy field map
    const [userForFieldMap, errForFieldMap] = await Repository.fetchOne({
      tableName: DB_TABLES.COMPANY,
      query: {
        company_id: company_id,
      },
      include: {
        [DB_TABLES.COMPANY_SETTINGS]: {
          [DB_TABLES.SELLSY_FIELD_MAP]: {},
        },
      },
      extras: {
        attributes: ['company_id'],
      },
    });
    if (errForFieldMap) return [null, 'Unable to fetch field map'];
    if (!userForFieldMap)
      return [null, 'Please ask admin to set Sellsy field map'];

    const sellsyFieldMap = userForFieldMap?.Company_Setting?.Sellsy_Field_Map;
    return [sellsyFieldMap, null];
  } catch (err) {
    logger.error(
      'An error occurred while fetching field map for company from user: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = getFieldMapForCompany;
