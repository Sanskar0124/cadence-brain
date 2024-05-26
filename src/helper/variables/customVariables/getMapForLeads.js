// Utils
const logger = require('../../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../../utils/enums');
const formatter = require('./utils/formatter');

// Helpers and Services
const crmIntegration = require('../../../grpc/v2/crm-integration');
const hiringIntegration = require('../../../grpc/v2/hiring-integration');

const getMapForLeads = async (
  crm_integration_type,
  integration_id,
  access_token,
  instance_url
) => {
  try {
    const fieldMap = {};

    switch (crm_integration_type) {
      case CRM_INTEGRATIONS.SALESFORCE: {
        const [[fieldData, errForFieldData], [leadData, errForLeadData]] =
          await Promise.all([
            crmIntegration.describeObject({
              integration_type: CRM_INTEGRATIONS.SALESFORCE,
              integration_data: JSON.stringify({
                object: 'lead',
                access_token,
                instance_url,
              }),
            }),
            crmIntegration.getLead({
              integration_type: CRM_INTEGRATIONS.SALESFORCE,
              integration_data: {
                salesforce_lead_id: integration_id,
                access_token,
                instance_url,
              },
            }),
          ]);
        if (errForFieldData || errForLeadData)
          return [null, errForFieldData ?? errForLeadData];

        fieldData?.data?.forEach((field) => {
          const formatedLabel = formatter(field?.label, 'lead');
          fieldMap[formatedLabel] = leadData?.data[field?.name];
        });
        break;
      }
      case CRM_INTEGRATIONS.ZOHO: {
        const [[fieldData, errForFieldData], [leadData, errForLeadData]] =
          await Promise.all([
            crmIntegration.describeObject({
              integration_type: CRM_INTEGRATIONS.ZOHO,
              integration_data: JSON.stringify({
                object: 'lead',
                access_token,
                instance_url,
              }),
            }),
            crmIntegration.getLead({
              integration_type: CRM_INTEGRATIONS.ZOHO,
              integration_data: {
                lead_id: integration_id,
                access_token,
                instance_url,
              },
            }),
          ]);
        if (errForFieldData || errForLeadData)
          return [null, errForFieldData ?? errForLeadData];

        fieldData?.forEach((field) => {
          if (!field?.field_read_only && field?.view_type?.edit) {
            const formatedLabel = formatter(field?.field_label, 'lead');
            fieldMap[formatedLabel] = leadData[field?.api_name];
          }
        });
        break;
      }
      case CRM_INTEGRATIONS.BULLHORN: {
        const [[fieldData, errForFieldData], [leadData, errForLeadData]] =
          await Promise.all([
            hiringIntegration.describeObject({
              integration_type: CRM_INTEGRATIONS.BULLHORN,
              integration_data: JSON.stringify({
                object: 'lead',
                access_token,
                instance_url,
              }),
            }),
            hiringIntegration.getLead({
              integration_type: CRM_INTEGRATIONS.BULLHORN,
              integration_data: {
                lead_id: integration_id,
                access_token,
                instance_url,
              },
            }),
          ]);
        if (errForFieldData || errForLeadData)
          return [null, errForFieldData ?? errForLeadData];

        fieldData?.fields?.forEach((field) => {
          if (
            field.readOnly == false &&
            Object.keys(field).includes('dataType') &&
            field.dataType !== 'Address' &&
            field.dataType !== 'SecondaryAddress' &&
            field.dataType !== 'OnboardingReceivedSent' &&
            field.dataType !== 'BillingAddress'
          ) {
            const formatedLabel = formatter(field.label, 'lead');
            fieldMap[formatedLabel] = leadData[field.name];
          }
        });
        break;
      }
    }

    return [fieldMap, null];
  } catch (err) {
    logger.error('Error while fetching custom variables map for leads: ', err);
    return [null, err.message];
  }
};

module.exports = getMapForLeads;
