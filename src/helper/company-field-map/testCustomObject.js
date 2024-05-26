// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  SALESFORCE_SOBJECTS,
  CRM_INTEGRATIONS,
  PIPEDRIVE_ENDPOINTS,
  ZOHO_ENDPOINTS,
  BULLHORN_ENDPOINTS,
  HIRING_INTEGRATIONS,
  SELLSY_ENDPOINTS,
  DYNAMICS_ENDPOINTS,
} = require('../../utils/enums');

// * Helpers & Services
const SalesforceService = require('../../services/Salesforce');
const SellsyService = require('../../services/Sellsy');
const SellsyHelper = require('../sellsy');

// * GRPC
const v2GrpcClients = require('../../grpc/v2');

// * Create field map for company
const testCustomObject = async ({
  data,
  access_token,
  instance_url,
  crm_integration,
}) => {
  try {
    // * Use CRM Integration specific logic to test relevant custom object
    switch (crm_integration) {
      case CRM_INTEGRATIONS.SALESFORCE:
        // * If (salesforce_lead_id !== null) => updateLead, else updateContact
        if (data.value.type === SALESFORCE_SOBJECTS.LEAD) {
          const [_, errForUpdatingLead] = await SalesforceService.updateLead(
            data.value.id,
            data.value.custom_object,
            access_token,
            instance_url
          );
          if (errForUpdatingLead) {
            if (errForUpdatingLead.includes('No such column')) {
              let missingFieldInSalesforce =
                errForUpdatingLead.match(/'(.*?)'/)[1];
              return [
                null,
                `Could not find ${missingFieldInSalesforce} on lead in salesforce`,
              ];
            }
            return [null, errForUpdatingLead];
          }
        } else {
          const [_, errForUpdatingContact] =
            await SalesforceService.updateContact(
              data.value.id,
              data.value.custom_object,
              access_token,
              instance_url
            );
          if (errForUpdatingContact) {
            if (errForUpdatingContact.includes('No such column')) {
              let missingFieldInSalesforce =
                errForUpdatingContact.match(/'(.*?)'/)[1];
              return [
                null,
                `Could not find ${missingFieldInSalesforce} on contact in salesforce`,
              ];
            }
            return [null, errForUpdatingContact];
          }

          // * Logic to update account
          if (
            data?.value.custom_object_account &&
            Object.keys(data?.value?.custom_object_account)?.length > 0
          ) {
            const [__, errForUpdatingAccount] =
              await SalesforceService.updateAccount(
                data.value.salesforce_account_id,
                data.value.custom_object_account,
                access_token,
                instance_url
              );
            if (errForUpdatingAccount) {
              if (errForUpdatingAccount.includes('No such column')) {
                let missingFieldInSalesforce =
                  errForUpdatingAccount.match(/'(.*?)'/)[1];
                return [
                  null,
                  `Could not find ${missingFieldInSalesforce} on account in salesforce`,
                ];
              }
              return [null, errForUpdatingAccount];
            }
          }
        }
        break;
      case CRM_INTEGRATIONS.PIPEDRIVE:
        let [_, errUpdatingPerson] =
          await v2GrpcClients.crmIntegration.updateContact({
            integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
            integration_data: {
              person_id: data.value.person_id,
              person: data.value.person_object,
              access_token,
              instance_url,
            },
          });
        if (errUpdatingPerson) return [null, errUpdatingPerson];

        // * Update organization
        if (data.value.organization_object) {
          await v2GrpcClients.crmIntegration.updateAccount({
            integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
            integration_data: {
              organization_id: data.value.organization_id,
              organization: data.value.organization_object,
              access_token,
              instance_url,
            },
          });
        }
        break;
      case CRM_INTEGRATIONS.HUBSPOT:
        let [__, errUpdatingContact] =
          await v2GrpcClients.crmIntegration.updateContact({
            integration_type: CRM_INTEGRATIONS.HUBSPOT,
            integration_data: {
              contact_id: data.value.contact_id,
              data: data.value.custom_object,
              access_token,
            },
          });
        if (errUpdatingContact) return [null, errUpdatingContact];

        // * Update organization
        if (data.value.custom_object_company) {
          await v2GrpcClients.crmIntegration.updateAccount({
            integration_type: CRM_INTEGRATIONS.HUBSPOT,
            integration_data: {
              company_id: data.value.hubspot_company_id,
              data: data.value.custom_object_company,
              access_token,
            },
          });
        }
        break;
      case CRM_INTEGRATIONS.ZOHO:
        if (data.value.type === ZOHO_ENDPOINTS.LEAD) {
          const [_, errForUpdatingLead] =
            await v2GrpcClients.crmIntegration.updateLead({
              integration_type: CRM_INTEGRATIONS.ZOHO,
              integration_data: {
                lead_id: data.value.id,
                lead: data.value.custom_object,
                access_token,
                instance_url,
              },
            });
          if (errForUpdatingLead) return [null, errForUpdatingLead];
        } else {
          const [_, errForUpdatingContact] =
            await v2GrpcClients.crmIntegration.updateContact({
              integration_type: CRM_INTEGRATIONS.ZOHO,
              integration_data: {
                contact_id: data.value.id,
                contact: data.value.custom_object,
                access_token,
                instance_url,
              },
            });
          if (errForUpdatingContact) return [null, errForUpdatingContact];

          // * Logic to update account
          if (
            data?.value.custom_object_account &&
            Object.keys(data?.value?.custom_object_account)?.length > 0
          ) {
            const [__, errForUpdatingAccount] =
              await v2GrpcClients.crmIntegration.updateAccount({
                integration_type: CRM_INTEGRATIONS.ZOHO,
                integration_data: {
                  account_id: data.value.zoho_account_id,
                  account: data.value.custom_object_account,
                  access_token,
                  instance_url,
                },
              });
            if (errForUpdatingAccount) return [null, errForUpdatingAccount];
          }
        }
        break;
      case HIRING_INTEGRATIONS.BULLHORN:
        if (data.value.type === BULLHORN_ENDPOINTS.LEAD) {
          const [_, errForUpdatingLead] =
            await v2GrpcClients.hiringIntegration.updateLead({
              integration_type: HIRING_INTEGRATIONS.BULLHORN,
              integration_data: {
                lead_id: data.value.id,
                lead: data.value.custom_object,
                access_token,
                instance_url,
              },
            });
          if (errForUpdatingLead) return [null, errForUpdatingLead];

          // * Logic to update account
          if (
            data?.value?.custom_object_corporation &&
            Object.keys(data?.value?.custom_object_corporation)?.length > 0
          ) {
            const [__, errForUpdatingAccount] =
              await v2GrpcClients.hiringIntegration.updateAccount({
                integration_type: HIRING_INTEGRATIONS.BULLHORN,
                integration_data: {
                  corporation_id: data.value.bullhorn_corporation_id,
                  corporation: data.value.custom_object_corporation,
                  access_token,
                  instance_url,
                },
              });
            if (errForUpdatingAccount) return [null, errForUpdatingAccount];
          }
        } else if (data.value.type === BULLHORN_ENDPOINTS.CANDIDATE) {
          const [_, errForUpdatingLead] =
            await v2GrpcClients.hiringIntegration.updateCandidate({
              integration_type: HIRING_INTEGRATIONS.BULLHORN,
              integration_data: {
                candidate_id: data.value.id,
                candidate: data.value.custom_object,
                access_token,
                instance_url,
              },
            });
          if (errForUpdatingLead) return [null, errForUpdatingLead];
        } else {
          const [_, errForUpdatingContact] =
            await v2GrpcClients.hiringIntegration.updateContact({
              integration_type: HIRING_INTEGRATIONS.BULLHORN,
              integration_data: {
                contact_id: data.value.id,
                contact: data.value.custom_object,
                access_token,
                instance_url,
              },
            });
          if (errForUpdatingContact) return [null, errForUpdatingContact];

          // * Logic to update account
          if (
            data?.value?.custom_object_corporation &&
            Object.keys(data?.value?.custom_object_corporation)?.length > 0
          ) {
            const [__, errForUpdatingAccount] =
              await v2GrpcClients.hiringIntegration.updateAccount({
                integration_type: HIRING_INTEGRATIONS.BULLHORN,
                integration_data: {
                  corporation_id: data.value.bullhorn_corporation_id,
                  corporation: data.value.custom_object_corporation,
                  access_token,
                  instance_url,
                },
              });
            if (errForUpdatingAccount) return [null, errForUpdatingAccount];
          }
        }

        break;
      case CRM_INTEGRATIONS.SELLSY:
        const [sellsyFieldMap, errFetchingSellsyFieldMap] =
          await SellsyHelper.getFieldMapForCompany(data.value.company_id);
        if (errFetchingSellsyFieldMap) return [null, errFetchingSellsyFieldMap];

        let customObjectMap = sellsyFieldMap.contact_custom_object.form;
        let contactData = {};
        let contactCustomData = []; // contains object with id and value
        let companyData = {};
        let companyCustomData = []; // contains object with id and value

        const { contact_custom_object, company_custom_object } = data.value;

        customObjectMap?.forEach((customObject) => {
          if (!customObject.editable) return;

          const sellsyField = customObject.sellsy_field;
          const sellsyFieldId = customObject.sellsy_field_id;
          const sellsyEndpoint = customObject.sellsy_endpoint;

          let value =
            sellsyEndpoint === SELLSY_ENDPOINTS.CONTACT
              ? contact_custom_object[sellsyField]
              : company_custom_object[sellsyField];

          if (sellsyFieldId) {
            const customData =
              sellsyEndpoint === SELLSY_ENDPOINTS.CONTACT
                ? contactCustomData
                : companyCustomData;

            if (value !== undefined)
              customData.push({ id: sellsyFieldId, value });
          } else {
            const data =
              sellsyEndpoint === SELLSY_ENDPOINTS.CONTACT
                ? contactData
                : companyData;

            if (sellsyField.includes('.')) {
              const [key, subKey] = sellsyField.split('.');
              if (!data[key]) data[key] = {};
              if (key === 'social' && value) {
                if (!value.startsWith('http') && !value.startsWith('https')) {
                  data[key][subKey] = `https://${value}`;
                  return;
                }
              }
              data[key][subKey] = value;
              return;
            }
            data[sellsyField] = value;
          }
        });

        let contactPromise, companyPromise;

        if (data.value?.id) {
          if (contactData?.smart_tags) {
            const [_, errForUpdatingContactTag] =
              await SellsyService.createSmartTags({
                access_token,
                id: data.value.id,
                smart_tags: contactData.smart_tags,
                integration_type: 'contacts',
              });
            if (errForUpdatingContactTag)
              return [null, errForUpdatingContactTag];
            delete contactData.smart_tags;
          }

          contactPromise = await Promise.all([
            v2GrpcClients.crmIntegration.updateContact({
              integration_type: CRM_INTEGRATIONS.SELLSY,
              integration_data: {
                contact_id: data.value.id,
                contact: contactData,
                access_token,
              },
            }),
            v2GrpcClients.crmIntegration.updateContact({
              integration_type: CRM_INTEGRATIONS.SELLSY,
              integration_data: {
                contact_id: data.value.id,
                contact: contactCustomData,
                is_custom: true,
                access_token,
              },
            }),
          ]);

          const [updatingContact, errForUpdatingContact] = contactPromise[0];
          if (errForUpdatingContact) return [null, errForUpdatingContact];

          const [updatingContactCustomData, errForUpdatingContactCustomData] =
            contactPromise[1];
          if (errForUpdatingContactCustomData)
            return [null, errForUpdatingContactCustomData];
        }

        if (data.value?.sellsy_company_id) {
          if (companyData?.smart_tags) {
            const [_, errForUpdatingCompanyTags] =
              await SellsyService.createSmartTags({
                access_token,
                id: data.value.sellsy_company_id,
                smart_tags: companyData.smart_tags,
                integration_type: 'companies',
              });
            if (errForUpdatingCompanyTags)
              return [null, errForUpdatingCompanyTags];
            delete companyData.smart_tags;
          }

          companyPromise = await Promise.all([
            v2GrpcClients.crmIntegration.updateAccount({
              integration_type: CRM_INTEGRATIONS.SELLSY,
              integration_data: {
                company_id: data.value.sellsy_company_id,
                company: companyData,
                access_token,
              },
            }),
            v2GrpcClients.crmIntegration.updateAccount({
              integration_type: CRM_INTEGRATIONS.SELLSY,
              integration_data: {
                company_id: data.value.sellsy_company_id,
                company: companyCustomData,
                is_custom: true,
                access_token,
              },
            }),
          ]);

          const [updatingCompany, errForUpdatingCompany] = companyPromise[0];
          if (errForUpdatingCompany) return [null, errForUpdatingCompany];

          const [updatingCompanyCustomData, errForUpdatingCompanyCustomData] =
            companyPromise[1];
          if (errForUpdatingCompanyCustomData)
            return [null, errForUpdatingCompanyCustomData];
        }
        break;
      case CRM_INTEGRATIONS.DYNAMICS:
        if (data.value.type === DYNAMICS_ENDPOINTS.LEAD) {
          const [_, errForUpdatingLead] =
            await v2GrpcClients.crmIntegration.updateLead({
              integration_type: CRM_INTEGRATIONS.DYNAMICS,
              integration_data: {
                lead_id: data.value.id,
                lead: data.value.custom_object,
                access_token,
                instance_url,
              },
            });
          if (errForUpdatingLead) return [null, errForUpdatingLead];
        } else {
          const [_, errForUpdatingContact] =
            await v2GrpcClients.crmIntegration.updateContact({
              integration_type: CRM_INTEGRATIONS.DYNAMICS,
              integration_data: {
                contact_id: data.value.id,
                contact: data.value.custom_object,
                access_token,
                instance_url,
              },
            });
          if (errForUpdatingContact) return [null, errForUpdatingContact];

          // * Logic to update account
          if (
            data?.value.custom_object_account &&
            Object.keys(data?.value?.custom_object_account)?.length &&
            data?.value?.dynamics_account_id
          ) {
            const [__, errForUpdatingAccount] =
              await v2GrpcClients.crmIntegration.updateAccount({
                integration_type: CRM_INTEGRATIONS.DYNAMICS,
                integration_data: {
                  account_id: data.value.dynamics_account_id,
                  account: data.value.custom_object_account,
                  access_token,
                  instance_url,
                },
              });
            if (errForUpdatingAccount) return [null, errForUpdatingAccount];
          }
        }
        break;
    }

    return [true, null];
  } catch (err) {
    logger.error(`An error occurred while testing custom field map : `, err);
    return [null, err.message];
  }
};

module.exports = {
  testCustomObject,
};
