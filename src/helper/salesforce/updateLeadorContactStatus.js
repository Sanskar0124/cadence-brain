//Utils
const logger = require('../../utils/winston');
const {
  LEAD_INTEGRATION_TYPES,
  CRM_INTEGRATIONS,
} = require('../../utils/enums');

//Services
const SalesforceService = require('../../services/Salesforce');
const v2GrpcClients = require('../../grpc/v2');

const updateLeadorContactStatus = async ({
  access_token,
  instance_url,
  lead,
  fieldMap,
  data,
}) => {
  try {
    if (!lead) return [null, 'No lead data provided'];

    let isUpdated, errUpdating;
    switch (lead?.integration_type) {
      case LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD:
        const { lead_map } = fieldMap;
        const { lead_status } = data;

        if (!lead_map?.integration_status?.name || !lead_status) {
          logger.error(`No lead status has been set`);
          return [null, 'Lead status is not set'];
        }

        [isUpdated, errUpdating] =
          await SalesforceService.updateLeadQualification(
            lead.integration_id,
            { [lead_map.integration_status.name]: lead_status },
            access_token,
            instance_url
          );
        break;
      case LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT:
        const { account_map, contact_map } = fieldMap;
        const { account_status, contact_status } = data;

        if (
          (!account_map?.integration_status?.name || !account_status) &&
          (!contact_map?.integration_status?.name || !contact_status)
        ) {
          logger.error(`No account and contact status has been set`);
          return [null, 'Account and contact status is not set'];
        }
        if (account_map?.integration_status?.name && account_status) {
          [isUpdated, errUpdating] =
            await SalesforceService.updateAccountQualification(
              lead.Account.integration_id,
              { [account_map.integration_status.name]: account_status },
              access_token,
              instance_url
            );
          if (errUpdating) return [null, errUpdating];
        }
        if (contact_map?.integration_status?.name && contact_status) {
          [isUpdated, errUpdating] =
            await v2GrpcClients.crmIntegration.updateContact({
              integration_type: CRM_INTEGRATIONS.SALESFORCE,
              integration_data: {
                sfContactId: lead.integration_id,
                contact: {
                  [contact_map.integration_status.name]: contact_status,
                },
                access_token,
                instance_url,
              },
            });
        }
        break;
    }
    if (errUpdating) return [null, errUpdating];
    return [true, null];
  } catch (err) {
    logger.error('Error while updating salesforce status: ', err);
    return [null, err.message];
  }
};

module.exports = updateLeadorContactStatus;
