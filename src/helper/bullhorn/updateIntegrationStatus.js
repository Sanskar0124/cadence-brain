//Utils
const logger = require('../../utils/winston');
const {
  LEAD_INTEGRATION_TYPES,
  HIRING_INTEGRATIONS,
} = require('../../utils/enums');

//Services
const v2GrpcClients = require('../../grpc/v2');

const updateIntegrationStatus = async ({
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
      case LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE:
        const { candidate_map } = fieldMap;
        const { candidate_status } = data;

        if (!candidate_map?.integration_status?.name || !candidate_status) {
          logger.error(`No lead status has been set`);
          return [null, 'Lead status is not set'];
        }

        [isUpdated, errUpdating] =
          await v2GrpcClients.hiringIntegration.updateCandidate({
            integration_type: HIRING_INTEGRATIONS.BULLHORN,
            integration_data: {
              candidate_id: {
                [candidate_map.integration_status.name]: candidate_status,
              },
              candidate: statusUpdate,
              access_token,
              instance_url,
            },
          });
        break;
      case LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT: {
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
            await v2GrpcClients.hiringIntegration.updateAccount({
              integration_type: HIRING_INTEGRATIONS.BULLHORN,
              integration_data: {
                corporation_id: lead?.Account?.integration_id,
                corporation: {
                  [account_map.integration_status.name]: account_status,
                },
                access_token,
                instance_url,
              },
            });
          if (errUpdating) return [null, errUpdating];
        }
        if (contact_map?.integration_status?.name && contact_status) {
          [isUpdated, errUpdating] =
            await v2GrpcClients.hiringIntegration.updateContact({
              integration_type: HIRING_INTEGRATIONS.BULLHORN,
              integration_data: {
                contact_id: lead.integration_id,
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
      case LEAD_INTEGRATION_TYPES.BULLHORN_LEAD: {
        const { account_map, lead_map } = fieldMap;
        const { account_status, lead_status } = data;

        if (
          (!account_map?.integration_status?.name || !account_status) &&
          (!lead_map?.integration_status?.name || !lead_status)
        ) {
          logger.error(`No account and contact status has been set`);
          return [null, 'Account and contact status is not set'];
        }
        if (
          account_map?.integration_status?.name &&
          account_status &&
          lead?.Account?.integration_id
        ) {
          [isUpdated, errUpdating] =
            await v2GrpcClients.hiringIntegration.updateAccount({
              integration_type: HIRING_INTEGRATIONS.BULLHORN,
              integration_data: {
                corporation_id: lead?.Account?.integration_id,
                corporation: {
                  [account_map.integration_status.name]: account_status,
                },
                access_token,
                instance_url,
              },
            });
          if (errUpdating) return [null, errUpdating];
        }
        if (lead_map?.integration_status?.name && lead_status) {
          [isUpdated, errUpdating] =
            await v2GrpcClients.hiringIntegration.updateLead({
              integration_type: HIRING_INTEGRATIONS.BULLHORN,
              integration_data: {
                lead_id: lead.integration_id,
                lead: { [lead_map.integration_status.name]: lead_status },
                access_token,
                instance_url,
              },
            });
        }
        if (!isUpdated) return [null, 'Nothing to update'];
        break;
      }
    }
    if (errUpdating) return [null, errUpdating];
    return [true, null];
  } catch (err) {
    logger.error('Error while updating bullhorn status: ', err);
    return [null, err.message];
  }
};

module.exports = updateIntegrationStatus;
