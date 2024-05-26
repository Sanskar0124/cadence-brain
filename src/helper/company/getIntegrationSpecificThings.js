// Utils
const logger = require('../../utils/winston');
const {
  CRM_INTEGRATIONS,
  USER_INTEGRATION_TYPES,
  LEAD_INTEGRATION_TYPES,
  HIRING_INTEGRATIONS,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

/**
 * returns an object containing list of integration specific things
 * @param {string} integration 
 * integration of the company
 * enum to be used: CRM_INTEGRATIONS 
 * @returns [data,err] 
 * structure for data  {
      enrichments: {
     	 lusha_phone,
     	 lusha_email,
     	 kaspr_phone,
     	 kaspr_email,
     	 hunter_email,
     	 dropcontact_email,
     	 snov_email,
     	 default_linkedin_export_type,
      },
      fieldMapTable,
      userIntegration,
      extensionFieldMapTable,
      tokenToCreate,
 * }
 * */
const getIntegrationSpecificThings = (integration) => {
  try {
    // Step: validation checks
    if (!Object.values(CRM_INTEGRATIONS).includes(integration))
      return [null, `Invalid integration: ${integration}`];
    // Step: variable declarations
    // return object
    let result = {};
    let fieldMapTable = null;
    let userIntegration = null;
    let extensionFieldMapTable = null;
    let tokenToCreate = null;
    let lushaObj = {};
    let kasprObj = {};
    let hunterObj = {};
    let snovObj = {};
    let dropcontactObj = {};
    let defaultLinkedinExportType = null;

    // case specific declaring of variables
    switch (integration) {
      case CRM_INTEGRATIONS.SALESFORCE:
        fieldMapTable = DB_TABLES.SALESFORCE_FIELD_MAP;
        userIntegration = USER_INTEGRATION_TYPES.SALESFORCE_OWNER;
        extensionFieldMapTable = DB_TABLES.EFM_SALESFORCE;
        tokenToCreate = DB_TABLES.SALESFORCE_TOKENS;
        lushaObj = {
          [LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
          [LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
        };
        kasprObj = {
          [LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT]: {
            fields: [],
          },
        };
        hunterObj = {
          [LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD]: {
            field: null,
          },
          [LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT]: {
            field: null,
          },
        };
        dropcontactObj = {
          [LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT]: {
            fields: [],
          },
        };
        snovObj = {
          [LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT]: {
            fields: [],
          },
        };
        defaultLinkedinExportType = LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD;
        break;

      case CRM_INTEGRATIONS.PIPEDRIVE:
        fieldMapTable = DB_TABLES.PIPEDRIVE_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_PIPEDRIVE;
        userIntegration = USER_INTEGRATION_TYPES.PIPEDRIVE_USER;
        tokenToCreate = DB_TABLES.PIPEDRIVE_TOKENS;
        lushaObj = {
          [LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
        };
        kasprObj = {
          [LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON]: {
            fields: [],
          },
        };
        hunterObj = {
          [LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON]: {
            field: null,
          },
        };
        dropcontactObj = {
          [LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON]: {
            fields: [],
          },
        };
        snovObj = {
          [LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON]: {
            fields: [],
          },
        };
        defaultLinkedinExportType = LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON;
        break;

      case CRM_INTEGRATIONS.HUBSPOT:
        fieldMapTable = DB_TABLES.HUBSPOT_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_HUBSPOT;
        userIntegration = USER_INTEGRATION_TYPES.HUBSPOT_OWNER;
        tokenToCreate = DB_TABLES.HUBSPOT_TOKENS;
        lushaObj = {
          [LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
        };
        kasprObj = {
          [LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT]: {
            fields: [],
          },
        };
        hunterObj = {
          [LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT]: {
            field: null,
          },
        };
        dropcontactObj = {
          [LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT]: {
            fields: [],
          },
        };
        snovObj = {
          [LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT]: {
            fields: [],
          },
        };
        break;

      case CRM_INTEGRATIONS.SHEETS:
        fieldMapTable = DB_TABLES.GOOGLE_SHEETS_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_GOOGLESHEETS;
        userIntegration = USER_INTEGRATION_TYPES.SHEETS_USER;
        lushaObj = {
          [LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
          [LEAD_INTEGRATION_TYPES.EXCEL_LEAD]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
        };
        kasprObj = {
          [LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.EXCEL_LEAD]: {
            fields: [],
          },
        };
        hunterObj = {
          [LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD]: {
            field: null,
          },
          [LEAD_INTEGRATION_TYPES.EXCEL_LEAD]: {
            field: null,
          },
        };
        dropcontactObj = {
          [LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.EXCEL_LEAD]: {
            fields: [],
          },
        };
        snovObj = {
          [LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.EXCEL_LEAD]: {
            fields: [],
          },
        };
        break;
      case CRM_INTEGRATIONS.ZOHO:
        fieldMapTable = DB_TABLES.ZOHO_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_ZOHO;
        userIntegration = USER_INTEGRATION_TYPES.ZOHO_USER;
        tokenToCreate = DB_TABLES.ZOHO_TOKENS;
        lushaObj = {
          [LEAD_INTEGRATION_TYPES.ZOHO_LEAD]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
          [LEAD_INTEGRATION_TYPES.ZOHO_CONTACT]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
        };
        kasprObj = {
          [LEAD_INTEGRATION_TYPES.ZOHO_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.ZOHO_CONTACT]: {
            fields: [],
          },
        };
        hunterObj = {
          [LEAD_INTEGRATION_TYPES.ZOHO_LEAD]: {
            field: null,
          },
          [LEAD_INTEGRATION_TYPES.ZOHO_CONTACT]: {
            field: null,
          },
        };
        dropcontactObj = {
          [LEAD_INTEGRATION_TYPES.ZOHO_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.ZOHO_CONTACT]: {
            fields: [],
          },
        };
        snovObj = {
          [LEAD_INTEGRATION_TYPES.ZOHO_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.ZOHO_CONTACT]: {
            fields: [],
          },
        };
        break;

      case CRM_INTEGRATIONS.SELLSY:
        fieldMapTable = DB_TABLES.SELLSY_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_SELLSY;
        userIntegration = USER_INTEGRATION_TYPES.SELLSY_OWNER;
        tokenToCreate = DB_TABLES.SELLSY_TOKENS;
        lushaObj = {
          [LEAD_INTEGRATION_TYPES.ZOHO_CONTACT]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
        };
        kasprObj = {
          [LEAD_INTEGRATION_TYPES.ZOHO_CONTACT]: {
            fields: [],
          },
        };
        hunterObj = {
          [LEAD_INTEGRATION_TYPES.ZOHO_CONTACT]: {
            field: null,
          },
        };
        dropcontactObj = {
          [LEAD_INTEGRATION_TYPES.ZOHO_CONTACT]: {
            fields: [],
          },
        };
        snovObj = {
          [LEAD_INTEGRATION_TYPES.ZOHO_CONTACT]: {
            fields: [],
          },
        };
        break;

      case HIRING_INTEGRATIONS.BULLHORN:
        fieldMapTable = DB_TABLES.BULLHORN_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_BULLHORN;
        userIntegration = USER_INTEGRATION_TYPES.BULLHORN_USER;
        tokenToCreate = DB_TABLES.BULLHORN_TOKENS;
        lushaObj = {
          [LEAD_INTEGRATION_TYPES.BULLHORN_LEAD]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
          [LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
          [LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE]: {
            personal_field: null,
            work_field: null,
            other_field: null,
          },
        };
        kasprObj = {
          [LEAD_INTEGRATION_TYPES.BULLHORN_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE]: {
            fields: [],
          },
        };
        hunterObj = {
          [LEAD_INTEGRATION_TYPES.BULLHORN_LEAD]: {
            field: null,
          },
          [LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT]: {
            field: null,
          },
          [LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE]: {
            field: null,
          },
        };
        dropcontactObj = {
          [LEAD_INTEGRATION_TYPES.BULLHORN_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE]: {
            fields: [],
          },
        };
        snovObj = {
          [LEAD_INTEGRATION_TYPES.BULLHORN_LEAD]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT]: {
            fields: [],
          },
          [LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE]: {
            fields: [],
          },
        };
        defaultLinkedinExportType = LEAD_INTEGRATION_TYPES.BULLHORN_LEAD;
        break;

      case CRM_INTEGRATIONS.DYNAMICS:
        fieldMapTable = DB_TABLES.DYNAMICS_FIELD_MAP;
        extensionFieldMapTable = DB_TABLES.EFM_DYNAMICS;
        userIntegration = USER_INTEGRATION_TYPES.DYNAMICS_OWNER;
        tokenToCreate = DB_TABLES.DYNAMICS_TOKENS;
        break;
    }

    // set enrichments object
    let enrichments = {
      lusha_phone: lushaObj,
      lusha_email: lushaObj,
      kaspr_phone: kasprObj,
      kaspr_email: kasprObj,
      hunter_email: hunterObj,
      dropcontact_email: dropcontactObj,
      snov_email: snovObj,
      default_linkedin_export_type: defaultLinkedinExportType,
    };

    // set result object to be returned
    result = {
      enrichments,
      fieldMapTable,
      userIntegration,
      extensionFieldMapTable,
      tokenToCreate,
    };

    return [result, null];
  } catch (err) {
    logger.error(`Error while fetching integration specific things: `, err);
    return [null, err.message];
  }
};

module.exports = getIntegrationSpecificThings;
