// Utils
const logger = require('../../utils/winston');
const {
  CRM_INTEGRATIONS,
  LEAD_INTEGRATION_TYPES,
} = require('../../utils/enums');

// Helpers and services
const AccessTokenHelper = require('../access-token');
const SalesforceService = require('../../services/Salesforce');

const updateCadenceMemberStatusInSalesforceUsingIntegrationId = async (
  lead,
  cadence,
  status
) => {
  try {
    if (
      cadence.salesforce_cadence_id === null ||
      cadence.salesforce_cadence_id === undefined ||
      cadence.salesforce_cadence_id === ''
    )
      return [null, 'Salesforce cadence id not present'];

    //     Fetching salesforce token and instance url
    //const [{ access_token, instance_url }, errForAccessToken] =
    //await SalesforceService.getAccessToken(lead.user_id);
    //if (errForAccessToken) return [null, errForAccessToken];

    const [{ access_token, instance_url }, errForAccessToken] =
      await AccessTokenHelper.getAccessToken({
        integration_type: CRM_INTEGRATIONS.SALESFORCE,
        user_id: lead.user_id,
      });

    let salesforceCadenceMemberId;
    if (lead.integration_type === LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD) {
      [salesforceCadenceMemberId, errForFetchingSalesforce] =
        await SalesforceService.getCadenceMemberByCadenceIdAndLeadId(
          cadence.salesforce_cadence_id,
          lead.integration_id,
          access_token,
          instance_url
        );
    } else if (
      lead.integration_type === LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT
    ) {
      [salesforceCadenceMemberId, errForFetchingSalesforce] =
        await SalesforceService.getCadenceMemberByCadenceIdAndContactId(
          cadence.salesforce_cadence_id,
          lead.integration_id,
          access_token,
          instance_url
        );
    }
    if (
      salesforceCadenceMemberId === null ||
      salesforceCadenceMemberId.length === 0
    )
      return [null, 'No link found between cadence and lead/contact.'];

    // If a link is found between cadence and lead/contact
    await SalesforceService.updateCadenceMember(
      salesforceCadenceMemberId[0].Id,
      {
        RingoverCadence__Status__c: status,
      },
      access_token,
      instance_url
    );
    return [true, null];
  } catch (err) {
    logger.error(
      `Error while updating cadence member status in salesforce using integration id: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = { updateCadenceMemberStatusInSalesforceUsingIntegrationId };
