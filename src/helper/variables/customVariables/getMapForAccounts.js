// Utils
const logger = require('../../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../../utils/enums');
const formatter = require('./utils/formatter');

// Helpers and Services
const crmIntegration = require('../../../grpc/v2/crm-integration');
const hiringIntegration = require('../../../grpc/v2/hiring-integration');
const SellsyHelper = require('../../sellsy');
const HtmlHelper = require('../../../helper/html');

const getMapForAccounts = async (
  crm_integration_type,
  integration_id,
  access_token,
  instance_url
) => {
  try {
    const fieldMap = {};

    switch (crm_integration_type) {
      case CRM_INTEGRATIONS.SALESFORCE: {
        const [[fieldData, errForFieldData], [accountData, errForAccountData]] =
          await Promise.all([
            crmIntegration.describeObject({
              integration_type: CRM_INTEGRATIONS.SALESFORCE,
              integration_data: JSON.stringify({
                object: 'account',
                access_token,
                instance_url,
              }),
            }),
            crmIntegration.getAccount({
              integration_type: CRM_INTEGRATIONS.SALESFORCE,
              integration_data: {
                salesforce_account_id: integration_id,
                access_token,
                instance_url,
              },
            }),
          ]);
        if (errForFieldData || errForAccountData)
          return [null, errForFieldData ?? errForAccountData];

        fieldData?.data?.forEach((field) => {
          const formatedLabel = formatter(field?.label, 'account');
          fieldMap[formatedLabel] = accountData?.data[field?.name];
        });
        break;
      }
      case CRM_INTEGRATIONS.HUBSPOT: {
        const [fieldData, errForFieldData] =
          await crmIntegration.describeObject({
            integration_type: CRM_INTEGRATIONS.HUBSPOT,
            integration_data: JSON.stringify({
              object: 'company',
              access_token,
            }),
          });
        if (errForFieldData) return [null, errForFieldData];

        let properties = '';
        fieldData?.results?.forEach((field, i) => {
          if (i == 0) properties += field.name;
          else properties += ',' + field.name;
        });

        const [accountData, errForAccountData] =
          await crmIntegration.getAccount({
            integration_type: CRM_INTEGRATIONS.HUBSPOT,
            integration_data: {
              company_id: integration_id,
              access_token,
              properties,
            },
          });
        if (errForAccountData) return [null, errForAccountData];

        fieldData?.results?.forEach((field) => {
          const formatedLabel = formatter(field?.label, 'company');
          fieldMap[formatedLabel] = accountData?.properties[field?.name];
        });
        break;
      }
      case CRM_INTEGRATIONS.PIPEDRIVE: {
        const [[fieldData, errForFieldData], [accountData, errForAccountData]] =
          await Promise.all([
            crmIntegration.describeObject({
              integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
              integration_data: JSON.stringify({
                object: 'organization',
                access_token,
                instance_url,
              }),
            }),
            crmIntegration.getAccount({
              integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
              integration_data: {
                id: integration_id,
                access_token,
                instance_url,
              },
            }),
          ]);
        if (errForFieldData || errForAccountData)
          return [null, errForFieldData ?? errForAccountData];

        fieldData?.data?.data?.forEach((field) => {
          const formatedLabel = formatter(field?.key, 'organization');
          const dataValue = accountData?.data[field?.key];
          if (typeof dataValue === 'string')
            fieldMap[formatedLabel] = dataValue;
          else if (typeof dataValue === 'object' && !Array.isArray(dataValue))
            fieldMap[formatedLabel] = dataValue?.value ?? null;
        });
        break;
      }
      case CRM_INTEGRATIONS.ZOHO: {
        const [[fieldData, errForFieldData], [accountData, errForAccountData]] =
          await Promise.all([
            crmIntegration.describeObject({
              integration_type: CRM_INTEGRATIONS.ZOHO,
              integration_data: JSON.stringify({
                object: 'account',
                access_token,
                instance_url,
              }),
            }),
            crmIntegration.getAccount({
              integration_type: CRM_INTEGRATIONS.ZOHO,
              integration_data: {
                account_id: integration_id,
                access_token,
                instance_url,
              },
            }),
          ]);
        if (errForFieldData || errForAccountData)
          return [null, errForFieldData ?? errForAccountData];

        fieldData?.forEach((field) => {
          if (!field?.field_read_only && field?.view_type?.edit) {
            const formatedLabel = formatter(field?.field_label, 'account');
            fieldMap[formatedLabel] = accountData[field?.api_name];
          }
        });
        break;
      }
      case CRM_INTEGRATIONS.SELLSY: {
        const fieldData = SellsyHelper.describeCompanyFields;
        const [accountData, errForAccountData] =
          await crmIntegration.getAccount({
            integration_type: CRM_INTEGRATIONS.SELLSY,
            integration_data: {
              company_id: integration_id,
              access_token,
            },
          });
        if (errForAccountData?.includes('Not Found'))
          return [null, 'Company not found in sellsy'];
        else if (errForAccountData) return [null, errForAccountData];

        fieldData?.company_fields?.forEach((field) => {
          if (field.editable === false || field.type !== 'string') return;
          const formatedLabel = formatter(field?.label, 'company');
          field.value
            ?.trim()
            ?.split('.')
            ?.forEach((key, index) => {
              if (index === 0) fieldMap[formatedLabel] = accountData[key];
              else fieldMap[formatedLabel] = fieldMap[formatedLabel]?.[key];
            });
          if (fieldMap[formatedLabel]?.length) {
            const [cleanString, _] = HtmlHelper.removeHtmlTags(
              fieldMap[formatedLabel]
            );
            fieldMap[formatedLabel] = cleanString;
          }
        });
        break;
      }
      case CRM_INTEGRATIONS.BULLHORN: {
        const [[fieldData, errForFieldData], [accountData, errForAccountData]] =
          await Promise.all([
            hiringIntegration.describeObject({
              integration_type: CRM_INTEGRATIONS.BULLHORN,
              integration_data: JSON.stringify({
                object: 'clientCorporation',
                access_token,
                instance_url,
              }),
            }),
            hiringIntegration.getAccount({
              integration_type: CRM_INTEGRATIONS.BULLHORN,
              integration_data: {
                corporation_id: integration_id,
                access_token,
                instance_url,
              },
            }),
          ]);
        if (errForFieldData || errForAccountData)
          return [null, errForFieldData ?? errForAccountData];

        fieldData?.fields?.forEach((field) => {
          if (
            field.readOnly == false &&
            Object.keys(field).includes('dataType') &&
            field.dataType !== 'Address' &&
            field.dataType !== 'SecondaryAddress' &&
            field.dataType !== 'OnboardingReceivedSent' &&
            field.dataType !== 'BillingAddress'
          ) {
            const formatedLabel = formatter(field.label, 'account');
            fieldMap[formatedLabel] = accountData[field.name];
          }
        });
        break;
      }
    }

    return [fieldMap, null];
  } catch (err) {
    logger.error(
      'Error while fetching custom variables map for accounts: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = getMapForAccounts;
