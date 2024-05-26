// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { SALESFORCE_SOBJECTS } = require('../../utils/enums');

// Repository
const Repository = require('../../repository');
const { sequelize } = require('../../db/models');

const getFieldMapForCompanyFromUser = async (
  user_id,
  SobjectMapType = false
) => {
  try {
    // * Fetch salesforce field map
    let [user, errFetchingUser] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: {
        user_id: user_id,
      },
      extras: {
        attributes: ['first_name'],
      },
      include: {
        [DB_TABLES.COMPANY]: {
          attributes: ['name'],
          [DB_TABLES.COMPANY_SETTINGS]: {
            [DB_TABLES.SALESFORCE_FIELD_MAP]: {},
          },
        },
      },
    });
    if (errFetchingUser) return [null, 'Unable to fetch user'];
    if (!user) return [null, 'Unable to fetch user'];

    let salesforceFieldMap =
      user?.Company?.Company_Setting?.Salesforce_Field_Map;

    if (salesforceFieldMap) {
      if (!SobjectMapType) return [salesforceFieldMap, null];

      switch (SobjectMapType) {
        case SALESFORCE_SOBJECTS.ACCOUNT:
          return [salesforceFieldMap.account_map, null];
        case SALESFORCE_SOBJECTS.LEAD:
          return [salesforceFieldMap.lead_map, null];
        case SALESFORCE_SOBJECTS.CONTACT:
          return [salesforceFieldMap.contact_map, null];
        case SALESFORCE_SOBJECTS.OPPORTUNITY:
          return [salesforceFieldMap.opportunity_map, null];
        default:
          return [null, 'Invalid map requested'];
      }
    } else return [null, 'Please ask admin to set salesforce field map'];
  } catch (err) {
    logger.error(
      'An error occurred while fetching field map for company from user: ',
      err
    );
    return [null, err.message];
  }
};

const getFieldMapForCompanyFromCompany = async (
  company_id,
  SobjectMapType = false
) => {
  try {
    // * Fetch salesforce field map
    let [company, errForCompany] = await Repository.fetchOne({
      tableName: DB_TABLES.COMPANY,
      query: {
        company_id,
      },
      extras: {
        attributes: ['company_id'],
      },
      include: {
        [DB_TABLES.COMPANY_SETTINGS]: {
          [DB_TABLES.SALESFORCE_FIELD_MAP]: {},
        },
      },
    });
    if (errForCompany) return [null, 'Unable to fetch company'];
    if (!company) return [null, 'Unable to fetch company'];

    let salesforceFieldMap = company?.Company_Setting?.Salesforce_Field_Map;

    if (salesforceFieldMap) {
      if (!SobjectMapType) return [salesforceFieldMap, null];

      switch (SobjectMapType) {
        case SALESFORCE_SOBJECTS.ACCOUNT:
          return [salesforceFieldMap.account_map, null];
        case SALESFORCE_SOBJECTS.LEAD:
          return [salesforceFieldMap.lead_map, null];
        case SALESFORCE_SOBJECTS.CONTACT:
          return [salesforceFieldMap.contact_map, null];
        case SALESFORCE_SOBJECTS.OPPORTUNITY:
          return [salesforceFieldMap.opportunity_map, null];
        default:
          return [null, 'Invalid map requested'];
      }
    } else return [null, 'Please ask admin to set salesforce field map'];
  } catch (err) {
    logger.error(
      'An error occurred while fetching field map for company from company: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = {
  getFieldMapForCompanyFromUser,
  getFieldMapForCompanyFromCompany,
};
