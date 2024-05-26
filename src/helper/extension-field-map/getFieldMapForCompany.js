// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  SALESFORCE_SOBJECTS,
  CRM_INTEGRATIONS,
  EXTENSION_FIELD_MAP_MODEL_NAMES,
} = require('../../utils/enums');

// Repository
const Repository = require('../../repository');

const getFieldMapForCompanyFromUser = async ({ user_id }, t) => {
  try {
    // * Fetch company integration type
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
    });
    if (errFetchingUser) return [null, errFetchingUser];
    if (!user) return [null, 'User not found'];

    let crm_integration = user?.Company.integration_type;
    if (!Object.values(CRM_INTEGRATIONS).includes(crm_integration))
      return [null, 'Invalid CRM Integration. Please contact support'];

    let fieldTable = false;
    let model = false;

    // * Use CRM Integration specific logic to fetch relevant field map
    switch (crm_integration) {
      case CRM_INTEGRATIONS.SALESFORCE:
        fieldTable = DB_TABLES.EFM_SALESFORCE;
        model = EXTENSION_FIELD_MAP_MODEL_NAMES.SALESFORCE;
        break;
      case CRM_INTEGRATIONS.PIPEDRIVE:
        fieldTable = DB_TABLES.EFM_PIPEDRIVE;
        model = EXTENSION_FIELD_MAP_MODEL_NAMES.PIPEDRIVE;
        break;
      case CRM_INTEGRATIONS.HUBSPOT:
        fieldTable = DB_TABLES.EFM_HUBSPOT;
        model = EXTENSION_FIELD_MAP_MODEL_NAMES.HUBSPOT;
        break;
      case CRM_INTEGRATIONS.SHEETS:
        fieldTable = DB_TABLES.EFM_GOOGLESHEETS;
        model = EXTENSION_FIELD_MAP_MODEL_NAMES.GOOGLE_SHEETS;
        break;
      case CRM_INTEGRATIONS.ZOHO:
        fieldTable = DB_TABLES.EFM_ZOHO;
        model = EXTENSION_FIELD_MAP_MODEL_NAMES.ZOHO;
        break;
      case CRM_INTEGRATIONS.SELLSY:
        fieldTable = DB_TABLES.EFM_SELLSY;
        model = EXTENSION_FIELD_MAP_MODEL_NAMES.SELLSY;
        break;
      case CRM_INTEGRATIONS.BULLHORN:
        fieldTable = DB_TABLES.EFM_BULLHORN;
        model = EXTENSION_FIELD_MAP_MODEL_NAMES.BULLHORN;
        break;
      case CRM_INTEGRATIONS.DYNAMICS:
        fieldTable = DB_TABLES.EFM_DYNAMICS;
        model = EXTENSION_FIELD_MAP_MODEL_NAMES.DYNAMICS;
        break;
      default:
        return [null, 'Invalid integration'];
    }
    if (!fieldTable) return [null, 'Cannot find relevant field table'];

    // * Fetch relevant field map
    [user, errFetchingUser] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: {
        user_id,
      },
      extras: {
        attributes: ['first_name'],
      },
      include: {
        [DB_TABLES.COMPANY]: {
          attributes: ['name'],
          [DB_TABLES.COMPANY_SETTINGS]: {
            [fieldTable]: {},
          },
        },
      },
      t,
    });
    if (errFetchingUser) {
      logger.error(`An error occurred while fetching user: ` + errFetchingUser);
      return [null, errFetchingUser];
    }
    if (!user) return [null, 'Unable to fetch user'];

    let fieldMap = user?.Company?.Company_Setting?.[model];
    if (!fieldMap) return [null, 'Unable to find field map for company'];

    return [fieldMap, null];
  } catch (err) {
    logger.error(
      'An error occurred while fetching extension field map from user: ',
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
          [DB_TABLES.EFM_SALESFORCE]: {},
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
