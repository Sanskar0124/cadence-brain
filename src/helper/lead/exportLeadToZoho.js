// * Utils
const logger = require('../../utils/winston');
const { clean } = require('../json');
const {
  LEAD_INTEGRATION_TYPES,
  ACCOUNT_INTEGRATION_TYPES,
} = require('../../utils/enums');

// * Helpers and services
const ZohoService = require('../../services/Zoho');
const CompanyFieldMapHelper = require('../company-field-map');

const exportLeadToZoho = async ({
  access_token,
  instance_url,
  zohoLeadMap,
  lead,
}) => {
  try {
    // * Encode Lead
    let encodedLead = {};
    if (zohoLeadMap.first_name)
      encodedLead[zohoLeadMap.first_name] = lead.first_name;
    if (zohoLeadMap.last_name)
      encodedLead[zohoLeadMap.last_name] = lead.last_name;
    if (zohoLeadMap.job_position)
      encodedLead[zohoLeadMap.job_position] = lead.job_position;
    if (zohoLeadMap.linkedin_url)
      encodedLead[zohoLeadMap.linkedin_url] = lead.linkedin_url;
    if (zohoLeadMap.company)
      encodedLead[zohoLeadMap.company] = lead.account.name;
    if (zohoLeadMap.country)
      encodedLead[zohoLeadMap.country] = lead.account.country;
    if (zohoLeadMap.url) encodedLead[zohoLeadMap.url] = lead.account.url;
    if (zohoLeadMap.zip_code)
      encodedLead[zohoLeadMap.zip_code] = `${lead.account.zipcode}`;
    if (
      CompanyFieldMapHelper.getCompanySize({
        size: zohoLeadMap.size,
      })[0]
    ) {
      try {
        lead.account.size = parseInt(lead.account.size);
        if (isNaN(lead.account.size)) lead.account.size = null;
        else
          encodedLead[
            CompanyFieldMapHelper.getCompanySize({
              size: zohoLeadMap.size,
            })[0]
          ] = `${lead.account.size}`;
      } catch (err) {
        logger.error('Unable to parse company size of account');
      }
    }

    // * Phone numbers and Emails
    lead.phone_numbers?.forEach((lead_phone_number) => {
      encodedLead[lead_phone_number.type] = lead_phone_number.phone_number;
    });
    lead.emails?.forEach((lead_email) => {
      encodedLead[lead_email.type] = lead_email.email_id;
    });

    encodedLead = Object.entries(encodedLead).reduce((acc, [key, value]) => {
      if (value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    logger.info(`Lead obj zoho: ${JSON.stringify(encodedLead, null, 2)}`);

    const [createdLead, errForCreatedLead] = await ZohoService.createLead({
      access_token,
      instance_url,
      lead: { data: [encodedLead] },
    });
    if (errForCreatedLead) return [null, errForCreatedLead];

    lead.integration_id = createdLead.data[0].details.id;
    lead.integration_type = LEAD_INTEGRATION_TYPES.ZOHO_LEAD;
    lead.account.integration_type = ACCOUNT_INTEGRATION_TYPES.ZOHO_ACCOUNT;
    logger.info(
      `Created Lead: ${lead?.account?.name} with zoho account id: ${createdLead?.data[0]?.details?.id}.`
    );

    return [lead, null];
  } catch (err) {
    logger.error('Error while exporting lead to zoho: ', err);
    return [
      null,
      'Unable to create in zoho. Please ensure field map is setup correctly and try again',
    ];
  }
};

module.exports = exportLeadToZoho;
