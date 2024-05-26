// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  SALESFORCE_SOBJECTS,
  CRM_INTEGRATIONS,
  PIPEDRIVE_ENDPOINTS,
  EXTENSION_FIELD_MAP_MODEL_NAMES,
} = require('../../utils/enums');

// Repository
const Repository = require('../../repository');

// * Create field map for company
const createExtensionFieldMap = async (
  { data, user_id, crm_integration },
  t
) => {
  try {
    let user, errFetchingUser;

    // * Use CRM Integration specific logic to create relevant maps
    switch (crm_integration) {
      case CRM_INTEGRATIONS.SALESFORCE:
        // * Fetch salesforce field map
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
                [DB_TABLES.EFM_SALESFORCE]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while fetching user: ` + errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) return [null, 'Unable to fetch user'];

        const efm_salesforce_id =
          user?.Company?.Company_Setting?.EFM_Salesforce?.efm_salesforce_id;
        if (!efm_salesforce_id)
          return [null, 'Unable to find extension field map for salesforce'];

        // * Switch logic for lead, contact, account
        switch (data.sobject_type) {
          case SALESFORCE_SOBJECTS.LEAD:
            await Repository.update({
              tableName: DB_TABLES.EFM_SALESFORCE,
              query: {
                efm_salesforce_id,
              },
              updateObject: { lead_map: data.sobject_values },
              t,
            });
            break;
          case SALESFORCE_SOBJECTS.CONTACT:
            await Repository.update({
              tableName: DB_TABLES.EFM_SALESFORCE,
              query: {
                efm_salesforce_id,
              },
              updateObject: { contact_map: data.sobject_values },
              t,
            });
            break;
          case SALESFORCE_SOBJECTS.ACCOUNT:
            await Repository.update({
              tableName: DB_TABLES.EFM_SALESFORCE,
              query: {
                efm_salesforce_id,
              },
              updateObject: { account_map: data.sobject_values },
              t,
            });
            break;
        }
        break;

      case CRM_INTEGRATIONS.PIPEDRIVE:
        // * Fetch salesforce field map
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
                [DB_TABLES.EFM_PIPEDRIVE]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while fetching user: ` + errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) {
          return [null, 'Unable to fetch user'];
        }

        const efm_pipedrive_id =
          user?.Company?.Company_Setting?.EFM_Pipedrive?.efm_pipedrive_id;
        if (!efm_pipedrive_id)
          return [null, 'Unable to find extension map for pipedrive'];

        // * Switch logic for lead, contact, account
        switch (data.endpoint_type) {
          case PIPEDRIVE_ENDPOINTS.PERSON:
            await Repository.update({
              tableName: DB_TABLES.EFM_PIPEDRIVE,
              query: {
                efm_pipedrive_id,
              },
              updateObject: { person_map: data.endpoint_values },
              t,
            });
            break;
          case PIPEDRIVE_ENDPOINTS.ORGANIZATION:
            await Repository.update({
              tableName: DB_TABLES.EFM_PIPEDRIVE,
              query: {
                efm_pipedrive_id,
              },
              updateObject: { organization_map: data.endpoint_values },
              t,
            });
            break;
        }
        break;

      default:
        return [null, 'Invalid integration'];
    }

    return [true, null];
  } catch (err) {
    logger.error(`An error occurred while create extension field map: `, err);
    return [null, err.message];
  }
};

// * Create field map for company
const updateAllExtensionFieldMap = async (
  { data, user_id, crm_integration },
  t
) => {
  try {
    let user, errFetchingUser;

    // * Use CRM Integration specific logic to create relevant maps
    switch (crm_integration) {
      case CRM_INTEGRATIONS.SALESFORCE:
        // * Fetch salesforce field map
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
                [DB_TABLES.EFM_SALESFORCE]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while fetching user: ` + errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) return [null, 'Unable to fetch user'];

        const efm_salesforce_id =
          user?.Company?.Company_Setting?.EFM_Salesforce?.efm_salesforce_id;
        if (!efm_salesforce_id)
          return [null, 'Unable to find extension field map for salesforce'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.EFM_SALESFORCE,
          query: {
            efm_salesforce_id,
          },
          updateObject: {
            contact_map: data.contact_map,
            lead_map: data.lead_map,
            account_map: data.account_map,
          },
          t,
        });
        break;

      case CRM_INTEGRATIONS.PIPEDRIVE:
        // * Fetch salesforce field map
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
                [DB_TABLES.EFM_PIPEDRIVE]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while fetching user: ` + errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) {
          return [null, 'Unable to fetch user'];
        }

        const efm_pipedrive_id =
          user?.Company?.Company_Setting?.EFM_Pipedrive?.efm_pipedrive_id;
        if (!efm_pipedrive_id)
          return [null, 'Unable to find extension field map for pipedrive'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.EFM_PIPEDRIVE,
          query: {
            efm_pipedrive_id,
          },
          updateObject: {
            person_map: data.person_map,
            organization_map: data.organization_map,
          },
          t,
        });
        break;

      case CRM_INTEGRATIONS.HUBSPOT:
        // * Fetch hubspot field map
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
                [DB_TABLES.EFM_HUBSPOT]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while fetching user: `,
            errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) return [null, 'Unable to fetch user'];

        const efm_hubspot_id =
          user?.Company?.Company_Setting?.EFM_Hubspot?.efm_hubspot_id;
        if (!efm_hubspot_id)
          return [null, 'Unable to find extension field map for hubspot'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.EFM_HUBSPOT,
          query: {
            efm_hubspot_id,
          },
          updateObject: {
            contact_map: data.contact_map,
            company_map: data.company_map,
          },
          t,
        });
        break;

      case CRM_INTEGRATIONS.ZOHO:
        // * Fetch zoho field map
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
                [DB_TABLES.EFM_ZOHO]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while fetching user: ` + errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) return [null, 'Unable to fetch user'];

        const efm_zoho_id =
          user?.Company?.Company_Setting?.EFM_Zoho?.efm_zoho_id;
        if (!efm_zoho_id)
          return [null, 'Unable to find extension field map for salesforce'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.EFM_ZOHO,
          query: {
            efm_zoho_id,
          },
          updateObject: {
            contact_map: data.contact_map,
            lead_map: data.lead_map,
            account_map: data.account_map,
          },
          t,
        });
        break;

      case CRM_INTEGRATIONS.SELLSY:
        // * Fetch sellsy field map
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
                [DB_TABLES.EFM_SELLSY]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while fetching user: `,
            errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) return [null, 'Unable to fetch user'];

        const efm_sellsy_id =
          user?.Company?.Company_Setting?.EFM_Sellsy?.efm_sellsy_id;
        if (!efm_sellsy_id)
          return [null, 'Unable to find extension field map for sellsy'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.EFM_SELLSY,
          query: {
            efm_sellsy_id,
          },
          updateObject: {
            contact_map: data.contact_map,
            company_map: data.company_map,
          },
          t,
        });
        break;

      case CRM_INTEGRATIONS.BULLHORN:
        // * Fetch bullhorn field map
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
                [DB_TABLES.EFM_BULLHORN]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while fetching user: `,
            errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) return [null, 'Unable to fetch user'];

        const efm_bullhorn_id =
          user?.Company?.Company_Setting?.EFM_Bullhorn?.efm_bullhorn_id;
        if (!efm_bullhorn_id)
          return [null, 'Unable to find extension field map for bullhorn'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.EFM_BULLHORN,
          query: {
            efm_bullhorn_id,
          },
          updateObject: {
            account_map: data.account_map,
            lead_map: data.lead_map,
            contact_map: data.contact_map,
            candidate_map: data.candidate_map,
          },
          t,
        });
        break;

      case CRM_INTEGRATIONS.DYNAMICS:
        // * Fetch dynamics field map
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
                [DB_TABLES.EFM_DYNAMICS]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while fetching user: `,
            errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) return [null, 'Unable to fetch user'];

        const efm_dynamics_id =
          user?.Company?.Company_Setting?.[
            EXTENSION_FIELD_MAP_MODEL_NAMES?.DYNAMICS
          ]?.efm_dynamics_id;
        if (!efm_dynamics_id)
          return [null, 'Unable to find extension field map for dynamics'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.EFM_DYNAMICS,
          query: {
            efm_dynamics_id,
          },
          updateObject: {
            account_map: data.account_map,
            lead_map: data.lead_map,
            contact_map: data.contact_map,
          },
          t,
        });
        break;

      default:
        return [null, 'Invalid integration'];
    }

    return [true, null];
  } catch (err) {
    logger.error(
      `An error occurred while creating all extension field maps: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = {
  createExtensionFieldMap,
  updateAllExtensionFieldMap,
};
