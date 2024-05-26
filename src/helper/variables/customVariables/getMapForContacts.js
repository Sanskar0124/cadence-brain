// Utils
const logger = require('../../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../../utils/enums');
const formatter = require('./utils/formatter');

// Helpers and Services
const crmIntegration = require('../../../grpc/v2/crm-integration');
const hiringIntegration = require('../../../grpc/v2/hiring-integration');
const SellsyHelper = require('../../sellsy');
const HtmlHelper = require('../../../helper/html');

const getMapForContacts = async (
  crm_integration_type,
  integration_id,
  access_token,
  instance_url
) => {
  try {
    const fieldMap = {};

    switch (crm_integration_type) {
      case CRM_INTEGRATIONS.SALESFORCE: {
        const [[fieldData, errForFieldData], [contactData, errForContactData]] =
          await Promise.all([
            crmIntegration.describeObject({
              integration_type: CRM_INTEGRATIONS.SALESFORCE,
              integration_data: JSON.stringify({
                object: 'contact',
                access_token,
                instance_url,
              }),
            }),
            crmIntegration.getContact({
              integration_type: CRM_INTEGRATIONS.SALESFORCE,
              integration_data: {
                salesforce_contact_id: integration_id,
                access_token,
                instance_url,
              },
            }),
          ]);
        if (errForFieldData || errForContactData)
          return [null, errForFieldData ?? errForContactData];

        fieldData?.data?.forEach((field) => {
          const formatedLabel = formatter(field?.label, 'contact');
          fieldMap[formatedLabel] = contactData?.data[field?.name];
        });
        break;
      }
      case CRM_INTEGRATIONS.HUBSPOT: {
        const [fieldData, errForFieldData] =
          await crmIntegration.describeObject({
            integration_type: CRM_INTEGRATIONS.HUBSPOT,
            integration_data: JSON.stringify({
              object: 'contact',
              access_token,
            }),
          });
        if (errForFieldData) return [null, errForFieldData];

        let properties = '';
        fieldData?.results?.forEach((field, i) => {
          if (i == 0) properties += field.name;
          else properties += ',' + field.name;
        });

        const [contactData, errForContactData] =
          await crmIntegration.getContact({
            integration_type: CRM_INTEGRATIONS.HUBSPOT,
            integration_data: {
              contact_id: integration_id,
              access_token,
              properties,
            },
          });
        if (errForContactData) return [null, errForContactData];

        fieldData?.results?.forEach((field) => {
          const formatedLabel = formatter(field?.label, 'contact');
          fieldMap[formatedLabel] = contactData?.properties[field?.name];
        });
        break;
      }
      case CRM_INTEGRATIONS.PIPEDRIVE: {
        const [[fieldData, errForFieldData], [contactData, errForContactData]] =
          await Promise.all([
            crmIntegration.describeObject({
              integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
              integration_data: JSON.stringify({
                object: 'person',
                access_token,
                instance_url,
              }),
            }),
            crmIntegration.getContact({
              integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
              integration_data: {
                person_id: integration_id,
                access_token,
                instance_url,
              },
            }),
          ]);
        if (errForFieldData || errForContactData)
          return [null, errForFieldData ?? errForContactData];

        fieldData?.data?.data?.forEach((field) => {
          const formatedLabel = formatter(field?.key, 'person');
          const dataValue = contactData?.data[field?.key];
          if (typeof dataValue === 'string')
            fieldMap[formatedLabel] = dataValue;
          else if (typeof dataValue === 'object' && !Array.isArray(dataValue))
            fieldMap[formatedLabel] = dataValue?.value ?? null;
        });
        break;
      }
      case CRM_INTEGRATIONS.ZOHO: {
        const [[fieldData, errForFieldData], [contactData, errForContactData]] =
          await Promise.all([
            crmIntegration.describeObject({
              integration_type: CRM_INTEGRATIONS.ZOHO,
              integration_data: JSON.stringify({
                object: 'contact',
                access_token,
                instance_url,
              }),
            }),
            crmIntegration.getContact({
              integration_type: CRM_INTEGRATIONS.ZOHO,
              integration_data: {
                contact_id: integration_id,
                access_token,
                instance_url,
              },
            }),
          ]);
        if (errForFieldData || errForContactData)
          return [null, errForFieldData ?? errForContactData];

        fieldData?.forEach((field) => {
          if (!field?.field_read_only && field?.view_type?.edit) {
            const formatedLabel = formatter(field?.field_label, 'contact');
            let dataValue = contactData[field?.api_name];
            if (typeof dataValue === 'object')
              dataValue = dataValue?.name ?? null;
            fieldMap[formatedLabel] = dataValue;
          }
        });
        break;
      }
      case CRM_INTEGRATIONS.SELLSY: {
        const fieldData = SellsyHelper.describeContactFields;
        const [contactData, errForContactData] =
          await crmIntegration.getContact({
            integration_type: CRM_INTEGRATIONS.SELLSY,
            integration_data: {
              contact_id: integration_id,
              access_token,
            },
          });
        if (errForContactData?.includes('Not Found'))
          return [null, 'Contact not found in sellsy'];
        else if (errForContactData) return [null, errForContactData];

        fieldData?.forEach((field) => {
          if (field.editable === false || field.type !== 'string') return;
          const formatedLabel = formatter(field?.label, 'contact');
          field.value
            ?.trim()
            ?.split('.')
            ?.forEach((key, index) => {
              if (index === 0) fieldMap[formatedLabel] = contactData[key];
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
        const [[fieldData, errForFieldData], [contactData, errForContactData]] =
          await Promise.all([
            hiringIntegration.describeObject({
              integration_type: CRM_INTEGRATIONS.BULLHORN,
              integration_data: JSON.stringify({
                object: 'clientContact',
                access_token,
                instance_url,
              }),
            }),
            hiringIntegration.getContact({
              integration_type: CRM_INTEGRATIONS.BULLHORN,
              integration_data: {
                contact_id: integration_id,
                access_token,
                instance_url,
              },
            }),
          ]);
        if (errForFieldData || errForContactData)
          return [null, errForFieldData ?? errForContactData];

        fieldData?.fields?.forEach((field) => {
          if (
            field.readOnly == false &&
            Object.keys(field).includes('dataType') &&
            field.dataType !== 'Address' &&
            field.dataType !== 'SecondaryAddress' &&
            field.dataType !== 'OnboardingReceivedSent' &&
            field.dataType !== 'BillingAddress'
          ) {
            const formatedLabel = formatter(field.label, 'contact');
            fieldMap[formatedLabel] = contactData[field.name];
          }
        });
        break;
      }
    }

    return [fieldMap, null];
  } catch (err) {
    logger.error(
      'Error while fetching custom variables map for contacts: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = getMapForContacts;
