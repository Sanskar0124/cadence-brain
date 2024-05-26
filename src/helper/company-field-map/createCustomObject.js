// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  SALESFORCE_SOBJECTS,
  CRM_INTEGRATIONS,
  PIPEDRIVE_ENDPOINTS,
  ZOHO_ENDPOINTS,
  HIRING_INTEGRATIONS,
  BULLHORN_ENDPOINTS,
  SELLSY_ENDPOINTS,
  DYNAMICS_ENDPOINTS,
} = require('../../utils/enums');

// * Helpers
const AccessTokenHelper = require('../access-token');
const {
  getNameFieldForSobject,
} = require('../salesforce/getNameFieldForSobject');

// Repository
const Repository = require('../../repository');

// * Create field map for company
const createCompanyCustomObject = async (
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

        // * Fetch salesforce token and instance URL
        const [{ access_token, instance_url }, errForAccessToken] =
          await AccessTokenHelper.getAccessToken({
            integration_type: crm_integration,
            user_id,
          });
        if (errForAccessToken) {
          if (errForAccessToken === 'Please log in with salesforce')
            return [null, 'Please log in with salesforce to save form.'];

          return [
            null,
            `Error while fetching tokens for salesforce: ${errForAccessToken}.`,
          ];
        }

        let references = [];
        let referencesToFetch = [];

        // * Create relevant map
        switch (data.object_type) {
          case SALESFORCE_SOBJECTS.LEAD: {
            data.custom_object[0].form.forEach((field) => {
              if (
                field.reference_to &&
                !referencesToFetch.includes(field.reference_to)
              ) {
                references.push(
                  getNameFieldForSobject(
                    field.reference_to,
                    access_token,
                    instance_url
                  )
                );
                referencesToFetch.push(field.reference_to);
              }
            });

            const resolvedPromises = await Promise.all(references);

            // * Describe references
            resolvedPromises.forEach((nameField) => {
              data.custom_object[0].form.forEach((field) => {
                if (nameField[0].sObject === field.reference_to)
                  field.reference_field_name = nameField[0];
              });
            });

            await Repository.update({
              tableName: DB_TABLES.SALESFORCE_FIELD_MAP,
              updateObject: {
                lead_custom_object: data.custom_object,
              },
              query: {
                sfm_id,
              },
              t,
            });
            return ['Successfully set salesforce field map', null];
          }
          case SALESFORCE_SOBJECTS.CONTACT: {
            data.custom_object[0].form.forEach((field) => {
              if (
                field.reference_to &&
                !referencesToFetch.includes(field.reference_to)
              ) {
                references.push(
                  getNameFieldForSobject(
                    field.reference_to,
                    access_token,
                    instance_url
                  )
                );
                referencesToFetch.push(field.reference_to);
              }
            });

            const resolvedPromises = await Promise.all(references);

            // * Describe references
            resolvedPromises.forEach((nameField) => {
              data.custom_object[0].form.forEach((field) => {
                if (nameField[0].sObject === field.reference_to)
                  field.reference_field_name = nameField[0];
              });
            });

            await Repository.update({
              tableName: DB_TABLES.SALESFORCE_FIELD_MAP,
              updateObject: {
                contact_custom_object: data.custom_object,
              },
              query: {
                sfm_id,
              },
              t,
            });
            return ['Successfully set salesforce field map', null];
          }
          case SALESFORCE_SOBJECTS.OPPORTUNITY: {
            data.custom_object[0].form.forEach((field) => {
              if (
                field.reference_to &&
                !referencesToFetch.includes(field.reference_to)
              ) {
                references.push(
                  getNameFieldForSobject(
                    field.reference_to,
                    access_token,
                    instance_url
                  )
                );
                referencesToFetch.push(field.reference_to);
              }
            });

            const resolvedPromises = await Promise.all(references);

            // * Describe references
            resolvedPromises.forEach((nameField) => {
              data.custom_object[0].form.forEach((field) => {
                if (nameField[0].sObject === field.reference_to)
                  field.reference_field_name = nameField[0];
              });
            });
            await Repository.update({
              tableName: DB_TABLES.SALESFORCE_FIELD_MAP,
              updateObject: {
                opportunity_custom_object: data.custom_object,
              },
              query: {
                sfm_id,
              },
              t,
            });

            return ['Successfully set salesforce field map', null];
          }
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
                attributes: ['company_settings_id'],
                [DB_TABLES.PIPEDRIVE_FIELD_MAP]: {
                  attributes: ['pfm_id'],
                },
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

        const pfm_id =
          user?.Company?.Company_Setting?.Pipedrive_Field_Map?.pfm_id;
        if (!pfm_id) return [null, 'Unable to find pipedrive map'];

        switch (data.object_type) {
          case PIPEDRIVE_ENDPOINTS.PERSON: {
            await Repository.update({
              tableName: DB_TABLES.PIPEDRIVE_FIELD_MAP,
              query: {
                pfm_id,
              },
              updateObject: {
                person_custom_object: data.custom_object,
              },
              t,
            });
            break;
          }
          case PIPEDRIVE_ENDPOINTS.DEAL: {
            const [dealMap, errForMap] = await Repository.update({
              tableName: DB_TABLES.PIPEDRIVE_FIELD_MAP,
              query: {
                pfm_id,
              },
              updateObject: {
                deal_custom_object: data.custom_object,
              },
              t,
            });
            break;
          }
        }
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
                attributes: ['company_settings_id'],
                [DB_TABLES.HUBSPOT_FIELD_MAP]: {
                  attributes: ['hsfm_id'],
                },
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

        await Repository.update({
          tableName: DB_TABLES.HUBSPOT_FIELD_MAP,
          query: {
            hsfm_id,
          },
          updateObject: {
            contact_custom_object: data.custom_object,
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

        // * Create relevant map
        switch (data.object_type) {
          case ZOHO_ENDPOINTS.LEAD: {
            await Repository.update({
              tableName: DB_TABLES.ZOHO_FIELD_MAP,
              updateObject: {
                lead_custom_object: data.custom_object,
              },
              query: {
                zfm_id,
              },
              t,
            });
            return ['Successfully set zoho field map', null];
          }
          case ZOHO_ENDPOINTS.CONTACT: {
            await Repository.update({
              tableName: DB_TABLES.ZOHO_FIELD_MAP,
              updateObject: {
                contact_custom_object: data.custom_object,
              },
              query: {
                zfm_id,
              },
              t,
            });
            return ['Successfully set zoho field map', null];
          }
        }
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

        // * Create relevant map
        switch (data.object_type) {
          case BULLHORN_ENDPOINTS.LEAD: {
            await Repository.update({
              tableName: DB_TABLES.BULLHORN_FIELD_MAP,
              updateObject: {
                lead_custom_object: data.custom_object,
              },
              query: {
                bfm_id,
              },
              t,
            });
            return ['Successfully set bullhorn field map', null];
          }
          case BULLHORN_ENDPOINTS.CONTACT: {
            await Repository.update({
              tableName: DB_TABLES.BULLHORN_FIELD_MAP,
              updateObject: {
                contact_custom_object: data.custom_object,
              },
              query: {
                bfm_id,
              },
              t,
            });
            return ['Successfully set bullhorn field map', null];
          }
          case BULLHORN_ENDPOINTS.CANDIDATE: {
            await Repository.update({
              tableName: DB_TABLES.BULLHORN_FIELD_MAP,
              updateObject: {
                candidate_custom_object: data.custom_object,
              },
              query: {
                bfm_id,
              },
              t,
            });
            return ['Successfully set bullhorn field map', null];
          }
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
                attributes: ['company_settings_id'],
                [DB_TABLES.SELLSY_FIELD_MAP]: {
                  attributes: ['sfm_id'],
                },
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

        const sellsy_fm_id =
          user?.Company?.Company_Setting?.Sellsy_Field_Map?.sfm_id;
        if (!sellsy_fm_id) return [null, 'Unable to find sellsy map'];

        await Repository.update({
          tableName: DB_TABLES.SELLSY_FIELD_MAP,
          query: {
            sfm_id: sellsy_fm_id,
          },
          updateObject: {
            contact_custom_object: data.custom_object,
          },
          t,
        });
        break;
      case CRM_INTEGRATIONS.DYNAMICS:
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
                [DB_TABLES.DYNAMICS_FIELD_MAP]: {},
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
        const dfm_id =
          user?.Company?.Company_Setting?.Dynamics_Field_Map?.dfm_id;
        if (!dfm_id) return [null, 'Unable to find dynamics map'];

        // * Create relevant map
        switch (data.object_type) {
          case DYNAMICS_ENDPOINTS.LEAD: {
            await Repository.update({
              tableName: DB_TABLES.DYNAMICS_FIELD_MAP,
              updateObject: {
                lead_custom_object: data.custom_object,
              },
              query: {
                dfm_id,
              },
              t,
            });
            return ['Successfully set dynamics field map', null];
          }
          case DYNAMICS_ENDPOINTS.CONTACT: {
            await Repository.update({
              tableName: DB_TABLES.DYNAMICS_FIELD_MAP,
              updateObject: {
                contact_custom_object: data.custom_object,
              },
              query: {
                dfm_id,
              },
              t,
            });
            return ['Successfully set dynamics field map', null];
          }
        }
        break;
    }
    return [true, null];
  } catch (err) {
    logger.error(
      `An error occurred while create company custom object : `,
      err
    );
    return [null, err.message];
  }
};

module.exports = {
  createCompanyCustomObject,
};
