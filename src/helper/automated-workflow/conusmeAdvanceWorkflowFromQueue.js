// Utils
const logger = require('../../utils/winston');
const { LEAD_INTEGRATION_TYPES } = require('../../utils/enums');

//grpc
const v2GrpcClients = require('../../grpc/v2');

const consumeAdvanceWorkFlowFromQueue = async (data) => {
  try {
    logger.info(JSON.parse(data));
    data = JSON.parse(data);
    logger.info(`Automated workflow received of: ${data?.integration_type}`);

    // if automatedTask does not have at_id or start_time, it is not valid
    if (!data?.integration_type) {
      logger.error(
        `Not valid since automated automated workflow received from queue has integration type: ${data?.integration_type}.`
      );

      return [
        null,
        `Not valid since automated automated workflow received from queue has integration type: ${data?.integration_type}.`,
      ];
    }

    switch (data?.integration_type) {
      case LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE:
        if (data?.integration_data.hasOwnProperty('fetched_lead_id')) {
          await v2GrpcClients.advancedWorkflow.updateBullhornCandidate({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addBullhornCandidate({
            integration_data: data.integration_data,
          });
        }
        break;
      case LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT:
        if (data?.integration_data.hasOwnProperty('fetched_lead_id')) {
          await v2GrpcClients.advancedWorkflow.updateBullhornContact({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addBullhornContact({
            integration_data: data.integration_data,
          });
        }
        break;
      case LEAD_INTEGRATION_TYPES.BULLHORN_LEAD:
        if (data?.integration_data.hasOwnProperty('fetched_lead_id')) {
          await v2GrpcClients.advancedWorkflow.updateBullhornLead({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addBullhornLead({
            integration_data: data.integration_data,
          });
        }
        break;
      case LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT:
        if (data?.integration_data.hasOwnProperty('fetched_lead_id')) {
          await v2GrpcClients.advancedWorkflow.updateHubspotContact({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addHubspotContact({
            integration_data: data.integration_data,
          });
        }
        break;
      case LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON:
        if (data?.integration_data.hasOwnProperty('fetchedLead')) {
          await v2GrpcClients.advancedWorkflow.updatePipedrivePerson({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addPipedrivePerson({
            integration_data: data.integration_data,
          });
        }
        break;
      case LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT:
        if (data?.integration_data.hasOwnProperty('fetchedLead')) {
          await v2GrpcClients.advancedWorkflow.updateSalesforceContact({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addSalesforceContact({
            integration_data: data.integration_data,
          });
        }
        break;
      case LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD:
        if (data?.integration_data.hasOwnProperty('fetchedLead')) {
          await v2GrpcClients.advancedWorkflow.updateSalesforceLead({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addSalesforceLead({
            integration_data: data.integration_data,
          });
        }
        break;
      case LEAD_INTEGRATION_TYPES.SELLSY_CONTACT:
        if (data?.integration_data.hasOwnProperty('fetched_lead_id')) {
          await v2GrpcClients.advancedWorkflow.updateSellsyContact({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addSellsyContact({
            integration_data: data.integration_data,
          });
        }
        break;
      case LEAD_INTEGRATION_TYPES.ZOHO_CONTACT:
        if (data?.integration_data.hasOwnProperty('fetched_lead_id')) {
          await v2GrpcClients.advancedWorkflow.updateZohoContact({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addZohoContact({
            integration_data: data.integration_data,
          });
        }
        break;
      case LEAD_INTEGRATION_TYPES.ZOHO_LEAD:
        if (data?.integration_data.hasOwnProperty('fetched_lead_id')) {
          await v2GrpcClients.advancedWorkflow.updateZohoLead({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addZohoLead({
            integration_data: data.integration_data,
          });
        }
        break;
      case LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT:
        if (data?.integration_data.hasOwnProperty('fetchedLead')) {
          await v2GrpcClients.advancedWorkflow.updateDynamicsContact({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addDynamicsContact({
            integration_data: data.integration_data,
          });
        }
        break;
      case LEAD_INTEGRATION_TYPES.DYNAMICS_LEAD:
        if (data?.integration_data.hasOwnProperty('fetchedLead')) {
          await v2GrpcClients.advancedWorkflow.updateDynamicsLead({
            integration_data: data.integration_data,
          });
        } else {
          await v2GrpcClients.advancedWorkflow.addDynamicsLead({
            integration_data: data.integration_data,
          });
        }
        break;
      default:
        logger.error('Invalid integration type');
        return [null, 'Invalid integration type'];
    }

    logger.info(`Completed ${data.integration_type}.`);
    return [`Completed ${data.integration_type}.`, null];
  } catch (err) {
    console.log(err);
    logger.error(
      `Error while consuming automated workflow from queue: ${err.message}.`
    );
    return [null, err.message];
  }
};

module.exports = consumeAdvanceWorkFlowFromQueue;
