// Utils
const logger = require('../../utils/winston');

// Helpers and services
const SalesforceService = require('../../services/Salesforce');
const AccessTokenHelper = require('../access-token');
const { CRM_INTEGRATIONS } = require('../../utils/enums');

const updateCadenceMemberStatusInSalesforce = async (lead, cadence, status) => {
  try {
    if (
      cadence.salesforce_cadence_id === null ||
      cadence.salesforce_cadence_id === undefined ||
      cadence.salesforce_cadence_id === ''
    )
      return [null, 'Salesforce cadence id not present'];

    // Fetching salesforce token and instance url
    const [{ access_token, instance_url }, errForAccessToken] =
      await AccessTokenHelper.getAccessToken({
        integration_type: CRM_INTEGRATIONS.SALESFORCE,
        user_id: lead.user_id,
      });
    if (errForAccessToken) return [null, errForAccessToken];

    let salesforceCadenceMemberId;
    if (lead.salesforce_lead_id) {
      [salesforceCadenceMemberId, errForFetchingSalesforce] =
        await SalesforceService.getCadenceMemberByCadenceIdAndLeadId(
          cadence.salesforce_cadence_id,
          lead.salesforce_lead_id,
          access_token,
          instance_url
        );
    } else {
      [salesforceCadenceMemberId, errForFetchingSalesforce] =
        await SalesforceService.getCadenceMemberByCadenceIdAndContactId(
          cadence.salesforce_cadence_id,
          lead.salesforce_contact_id,
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
      `Error while updating cadence member status in salesforce: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = { updateCadenceMemberStatusInSalesforce };
