// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  SALESFORCE_SOBJECTS,
  CRM_INTEGRATIONS,
  HIRING_INTEGRATIONS,
  PIPEDRIVE_ENDPOINTS,
  SELLSY_ENDPOINTS,
} = require('../../utils/enums');

// Repository
const Repository = require('../../repository');

// * Create field map for company
const createCompanyFieldMap = async ({ data, user_id, crm_integration }, t) => {
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
                [DB_TABLES.SALESFORCE_FIELD_MAP]: {},
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

        const sfm_id =
          user?.Company?.Company_Setting?.Salesforce_Field_Map?.sfm_id;
        if (!sfm_id) return [null, 'Unable to find salesforce map'];

        // * Switch logic for lead, contact, account
        switch (data.sobject_type) {
          case SALESFORCE_SOBJECTS.LEAD:
            await Repository.update({
              tableName: DB_TABLES.SALESFORCE_FIELD_MAP,
              query: {
                sfm_id,
              },
              updateObject: { lead_map: data.sobject_values },
              t,
            });
            break;
          case SALESFORCE_SOBJECTS.CONTACT:
            await Repository.update({
              tableName: DB_TABLES.SALESFORCE_FIELD_MAP,
              query: {
                sfm_id,
              },
              updateObject: { contact_map: data.sobject_values },
              t,
            });
            break;
          case SALESFORCE_SOBJECTS.ACCOUNT:
            await Repository.update({
              tableName: DB_TABLES.SALESFORCE_FIELD_MAP,
              query: {
                sfm_id,
              },
              updateObject: { account_map: data.sobject_values },
              t,
            });
            break;

          case SALESFORCE_SOBJECTS.OPPORTUNITY:
            await Repository.update({
              tableName: DB_TABLES.SALESFORCE_FIELD_MAP,
              query: {
                sfm_id,
              },
              updateObject: { opportunity_map: data.sobject_values },
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
                [DB_TABLES.PIPEDRIVE_FIELD_MAP]: {},
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

        const pfm_id =
          user?.Company?.Company_Setting?.Pipedrive_Field_Map?.pfm_id;
        if (!pfm_id) return [null, 'Unable to find pipedrive map'];

        // * Switch logic for lead, contact, account
        switch (data.endpoint_type) {
          case PIPEDRIVE_ENDPOINTS.PERSON:
            await Repository.update({
              tableName: DB_TABLES.PIPEDRIVE_FIELD_MAP,
              query: {
                pfm_id,
              },
              updateObject: { person_map: data.endpoint_values },
              t,
            });
            break;
          case PIPEDRIVE_ENDPOINTS.ORGANIZATION:
            await Repository.update({
              tableName: DB_TABLES.PIPEDRIVE_FIELD_MAP,
              query: {
                pfm_id,
              },
              updateObject: { organization_map: data.endpoint_values },
              t,
            });
            break;

          case PIPEDRIVE_ENDPOINTS.DEAL:
            await Repository.update({
              tableName: DB_TABLES.PIPEDRIVE_FIELD_MAP,
              query: {
                pfm_id,
              },
              updateObject: { deal_map: data.endpoint_values },
              t,
            });
            break;
        }
        break;
      case CRM_INTEGRATIONS.SELLSY:
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
                [DB_TABLES.SELLSY_FIELD_MAP]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while fetching Sellsy user: ` + errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) return [null, 'Unable to fetch Sellsy user'];

        const sfmId = user?.Company?.Company_Setting?.Sellsy_Field_Map?.sfm_id;
        if (!sfmId) return [null, 'Unable to find Sellsy map'];

        // * Switch logic for lead, contact, account
        switch (data.endpoint_type) {
          case SELLSY_ENDPOINTS.CONTACT:
            await Repository.update({
              tableName: DB_TABLES.SELLSY_FIELD_MAP,
              query: {
                sfm_id: sfmId,
              },
              updateObject: { contact_map: data.endpoint_values },
              t,
            });
            break;
          case SELLSY_ENDPOINTS.COMPANY:
            await Repository.update({
              tableName: DB_TABLES.SELLSY_FIELD_MAP,
              query: {
                sfm_id: sfmId,
              },
              updateObject: { company_map: data.endpoint_values },
              t,
            });
            break;
          default:
            return [null, 'Invalid endpoint type'];
        }
        break;

      default:
        return [null, 'Invalid integration'];
    }

    return [true, null];
  } catch (err) {
    logger.error(`An error occurred while create company field map : `, err);
    return [null, err.message];
  }
};

// * Create field map for company
const createAllCompanyFieldMap = async (
  { data, user_id, integration_type },
  t
) => {
  try {
    let user, errFetchingUser;

    // * Use CRM Integration specific logic to create relevant maps
    switch (integration_type) {
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
                [DB_TABLES.SALESFORCE_FIELD_MAP]: {},
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

        const sfm_id =
          user?.Company?.Company_Setting?.Salesforce_Field_Map?.sfm_id;
        if (!sfm_id) return [null, 'Unable to find salesforce map'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.SALESFORCE_FIELD_MAP,
          query: {
            sfm_id,
          },
          updateObject: {
            default_integration_status: data.default_integration_status,
            contact_map: data.contact_map,
            lead_map: data.lead_map,
            account_map: data.account_map,
            opportunity_map: data.opportunity_map,
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
                [DB_TABLES.PIPEDRIVE_FIELD_MAP]: {},
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

        const pfm_id =
          user?.Company?.Company_Setting?.Pipedrive_Field_Map?.pfm_id;
        if (!pfm_id) return [null, 'Unable to find pipedrive map'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.PIPEDRIVE_FIELD_MAP,
          query: {
            pfm_id,
          },
          updateObject: {
            person_map: data.person_map,
            organization_map: data.organization_map,
            deal_map: data.deal_map,
          },
          t,
        });
        break;
      case CRM_INTEGRATIONS.HUBSPOT:
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
                [DB_TABLES.HUBSPOT_FIELD_MAP]: {},
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

        const hsfm_id =
          user?.Company?.Company_Setting?.Hubspot_Field_Map?.hsfm_id;
        if (!hsfm_id) return [null, 'Unable to find hubspot map'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.HUBSPOT_FIELD_MAP,
          query: {
            hsfm_id,
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
                [DB_TABLES.ZOHO_FIELD_MAP]: {},
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
        const zfm_id = user?.Company?.Company_Setting?.Zoho_Field_Map?.zfm_id;
        if (!zfm_id) return [null, 'Unable to find zoho map'];
        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.ZOHO_FIELD_MAP,
          query: {
            zfm_id,
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
                [DB_TABLES.SELLSY_FIELD_MAP]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while Sellsy fetching user: ` + errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) return [null, 'Unable to fetch Sellsy user'];

        const sfmId = user?.Company?.Company_Setting?.Sellsy_Field_Map?.sfm_id;
        if (!sfmId) return [null, 'Unable to find Sellsy map'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.SELLSY_FIELD_MAP,
          query: {
            sfm_id: sfmId,
          },
          updateObject: {
            contact_map: data.contact_map,
            company_map: data.company_map,
          },
          t,
        });
        break;
      case HIRING_INTEGRATIONS.BULLHORN:
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
                [DB_TABLES.BULLHORN_FIELD_MAP]: {},
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
        const bfm_id =
          user?.Company?.Company_Setting?.Bullhorn_Field_Map?.bfm_id;
        if (!bfm_id) return [null, 'Unable to find bullhorn map'];
        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.BULLHORN_FIELD_MAP,
          query: {
            bfm_id,
          },
          updateObject: {
            default_integration_status: data.default_integration_status,
            contact_map: data.contact_map,
            lead_map: data.lead_map,
            candidate_map: data.candidate_map,
            account_map: data.account_map,
          },
          t,
        });
        break;
      case CRM_INTEGRATIONS.DYNAMICS:
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
                [DB_TABLES.DYNAMICS_FIELD_MAP]: {},
              },
            },
          },
          t,
        });
        if (errFetchingUser) {
          logger.error(
            `An error occurred while Dynamics fetching user: ` + errFetchingUser
          );
          return [null, errFetchingUser];
        }
        if (!user) return [null, 'Unable to fetch dynamics user'];

        const dfmId =
          user?.Company?.Company_Setting?.Dynamics_Field_Map?.dfm_id;
        if (!dfmId) return [null, 'Unable to find Dynamics map'];

        // * Update all values
        await Repository.update({
          tableName: DB_TABLES.DYNAMICS_FIELD_MAP,
          query: { dfm_id: dfmId },
          updateObject: {
            contact_map: data?.contact_map,
            lead_map: data?.lead_map,
            account_map: data?.account_map,
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
      `An error occurred while creating all company field maps : `,
      err
    );
    return [null, err.message];
  }
};

module.exports = {
  createCompanyFieldMap,
  createAllCompanyFieldMap,
};
