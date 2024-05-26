// Utils
const logger = require('../../utils/winston');
const {
  CRM_INTEGRATIONS,
  USER_INTEGRATION_TYPES,
  LEAD_INTEGRATION_TYPES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

const getDBTablesForIntegrations = (integration_type) => {
  try {
    let fieldMapTable = null,
      extensionFieldMapTable = null,
      userIntegration = null,
      tokensTable = null,
      allowedLeadIntegrationTypes = [];

    switch (integration_type) {
      case CRM_INTEGRATIONS.SALESFORCE:
        fieldMapTable = DB_TABLES.SALESFORCE_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_SALESFORCE;
        userIntegration = USER_INTEGRATION_TYPES.SALESFORCE_OWNER;
        allowedLeadIntegrationTypes = [
          LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD,
          LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT,
        ];
        tokensTable = DB_TABLES.SALESFORCE_TOKENS;
        break;
      case CRM_INTEGRATIONS.PIPEDRIVE:
        fieldMapTable = DB_TABLES.PIPEDRIVE_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_PIPEDRIVE;
        userIntegration = USER_INTEGRATION_TYPES.PIPEDRIVE_USER;
        allowedLeadIntegrationTypes = [LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON];
        tokensTable = DB_TABLES.PIPEDRIVE_TOKENS;
        break;
      case CRM_INTEGRATIONS.HUBSPOT:
        fieldMapTable = DB_TABLES.HUBSPOT_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_HUBSPOT;
        userIntegration = USER_INTEGRATION_TYPES.HUBSPOT_OWNER;
        allowedLeadIntegrationTypes = [LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT];
        tokensTable = DB_TABLES.HUBSPOT_TOKENS;
        break;
      case CRM_INTEGRATIONS.GOOGLE_SHEETS:
        fieldMapTable = DB_TABLES.GOOGLE_SHEETS_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_GOOGLESHEETS;
        userIntegration = USER_INTEGRATION_TYPES.GOOGLE_SHEETS_USER;
        allowedLeadIntegrationTypes = [
          LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD,
        ];
        tokensTable = null;
        break;
      case CRM_INTEGRATIONS.EXCEL:
        fieldMapTable = DB_TABLES.EXCEL_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_EXCEL;
        userIntegration = USER_INTEGRATION_TYPES.EXCEL_USER;
        allowedLeadIntegrationTypes = [LEAD_INTEGRATION_TYPES.EXCEL_LEAD];
        tokensTable = null;
        break;
      case CRM_INTEGRATIONS.ZOHO:
        fieldMapTable = DB_TABLES.ZOHO_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_ZOHO;
        userIntegration = USER_INTEGRATION_TYPES.ZOHO_USER;
        allowedLeadIntegrationTypes = [
          LEAD_INTEGRATION_TYPES.ZOHO_LEAD,
          LEAD_INTEGRATION_TYPES.ZOHO_CONTACT,
        ];
        tokensTable = DB_TABLES.ZOHO_TOKENS;
        break;

      default:
        logger.info(`Integration: ${integration_type} not supported.`);
        break;
    }
    return [
      {
        fieldMapTable,
        extensionFieldMapTable,
        userIntegration,
        allowedLeadIntegrationTypes,
        tokensTable,
      },
      null,
    ];
  } catch (err) {
    logger.error(`Error while fetching db tables for integrations: `, err);
    return [
      {
        fieldMapTable: null,
        extensionFieldMapTable: null,
        userIntegration: null,
        allowedLeadIntegrationTypes: null,
        tokensTable: null,
      },
      err.message,
    ];
  }
};

module.exports = getDBTablesForIntegrations;
