// * Utils
const logger = require('../../utils/winston');
const { clean } = require('../json');
const {
  LEAD_INTEGRATION_TYPES,
  ACCOUNT_INTEGRATION_TYPES,
  BULLHORN_ENDPOINTS,
} = require('../../utils/enums');

// * Helpers and services
const BullhornService = require('../../services/Bullhorn');
const CompanyFieldMapHelper = require('../company-field-map');

const exportLeadToBullhorn = async ({
  access_token,
  instance_url,
  bullhornLeadMap,
  bullhornAccountMap,
  lead,
}) => {
  try {
    if (lead.account?.integration_id) {
      lead.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.BULLHORN_ACCOUNT;
    } else {
      // * Encode Account
      let encodedAccount = {};
      if (bullhornAccountMap.name)
        encodedAccount[bullhornAccountMap.name] = lead.account.name;
      if (bullhornAccountMap.phone_number)
        encodedAccount[bullhornAccountMap.phone_number] =
          lead.account.phone_number;
      if (bullhornAccountMap.url)
        encodedAccount[bullhornAccountMap.url] = lead.account.url;
      if (bullhornAccountMap.country) {
        let obj = encodedAccount;
        let splitKeys = bullhornAccountMap.country.split('.');
        for (let i = 0; i < splitKeys.length - 1; i++) {
          let key = splitKeys[i];
          if (obj[key] === undefined) obj[key] = {};
          obj = obj[key];
        }
        obj[splitKeys[splitKeys.length - 1]] = lead.account.country;
      }
      if (bullhornAccountMap.zip_code) {
        let obj = encodedAccount;
        let splitKeys = bullhornAccountMap.zip_code.split('.');
        for (let i = 0; i < splitKeys.length - 1; i++) {
          let key = splitKeys[i];
          if (obj[key] === undefined) obj[key] = {};
          obj = obj[key];
        }
        obj[splitKeys[splitKeys.length - 1]] = lead.account.zipcode;
      }
      if (
        CompanyFieldMapHelper.getCompanySize({
          size: bullhornAccountMap?.size,
        })[0]
      ) {
        try {
          lead.account.size = parseInt(lead.account.size);
          if (isNaN(lead.account.size)) lead.account.size = null;
          else
            encodedAccount[
              CompanyFieldMapHelper.getCompanySize({
                size: bullhornAccountMap?.size,
              })[0]
            ] = lead.account.size;
        } catch (err) {
          logger.error('Unable to parse company size of account');
        }
      }
      logger.info('account obj: ' + JSON.stringify(encodedAccount, null, 2));

      // * Create Account
      const [createdAccount, errForCreatedAccount] =
        await BullhornService.exportEntity({
          access_token,
          instance_url,
          object: BULLHORN_ENDPOINTS.CORPORATION,
          body: encodedAccount,
        });
      if (errForCreatedAccount) return [null, errForCreatedAccount];

      lead.account.integration_id = createdAccount.changedEntityId;
      lead.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.BULLHORN_ACCOUNT;
      logger.info(
        `Created Account: ${lead.account.name} with bullhorn account id: ${createdAccount.changedEntityId}.`
      );
    }

    // * Encode Lead
    let encodedLead = {};
    if (bullhornLeadMap.first_name)
      encodedLead[bullhornLeadMap.first_name] = lead.first_name;
    if (bullhornLeadMap.last_name)
      encodedLead[bullhornLeadMap.last_name] = lead.last_name;
    if (bullhornLeadMap.job_position)
      encodedLead[bullhornLeadMap.job_position] = lead.job_position;
    if (bullhornLeadMap.linkedin_url)
      encodedLead[bullhornLeadMap.linkedin_url] = lead.linkedin_url;
    encodedLead.name = lead.first_name + ' ' + lead.last_name;
    encodedLead.clientCorporation = { id: lead.account.integration_id };

    // * Phone numbers and Emails
    lead.phone_numbers?.forEach((lead_phone_number) => {
      encodedLead[lead_phone_number.type] = lead_phone_number.phone_number;
    });
    lead.emails?.forEach((lead_email) => {
      encodedLead[lead_email.type] = lead_email.email_id;
    });

    // * Create Lead
    const [createdLead, errForCreatedLead] = await BullhornService.exportEntity(
      {
        access_token,
        instance_url,
        object: BULLHORN_ENDPOINTS.LEAD,
        body: encodedLead,
      }
    );
    if (errForCreatedLead) return [null, errForCreatedLead];

    lead.integration_id = createdLead.changedEntityId;
    lead.integration_type = LEAD_INTEGRATION_TYPES.BULLHORN_LEAD;
    logger.info(
      `Created Lead: ${
        lead.first_name + ' ' + lead.last_name
      } with bullhorn lead id: ${createdLead.changedEntityId}.`
    );

    return [lead, null];
  } catch (err) {
    logger.error('Error while exporting lead to bullhorn: ', err);
    return [
      null,
      'Unable to create lead in bullhorn. Please ensure field map is setup correctly and try again',
    ];
  }
};

module.exports = exportLeadToBullhorn;
