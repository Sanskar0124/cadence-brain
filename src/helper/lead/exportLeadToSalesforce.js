const logger = require('../../utils/winston');
const { clean } = require('../json');
const {
  LEAD_INTEGRATION_TYPES,
  ACCOUNT_INTEGRATION_TYPES,
} = require('../../utils/enums');

const SalesforceService = require('../../services/Salesforce');
const CompanyFieldMapHelper = require('../company-field-map');

const exportLeadToSalesforce = async ({
  access_token,
  instance_url,
  salesforce_owner_id,
  salesforceLeadMap,
  lead,
}) => {
  try {
    // * Encode Lead
    let encodedLead = {};
    if (salesforceLeadMap.first_name)
      encodedLead[salesforceLeadMap.first_name] = lead.first_name;
    if (salesforceLeadMap.last_name)
      encodedLead[salesforceLeadMap.last_name] = lead.last_name;
    if (salesforceLeadMap.job_position)
      encodedLead[salesforceLeadMap.job_position] = lead.job_position;
    if (salesforceLeadMap.linkedin_url)
      encodedLead[salesforceLeadMap.linkedin_url] = lead.linkedin_url;
    if (salesforceLeadMap.source_site)
      encodedLead[salesforceLeadMap.source_site] = lead.source_site;
    if (salesforceLeadMap.company)
      encodedLead[salesforceLeadMap.company] = lead.account.name;
    if (salesforceLeadMap.company_phone_number)
      encodedLead[salesforceLeadMap.company_phone_number] =
        lead.account.phone_number;
    if (salesforceLeadMap.country)
      encodedLead[salesforceLeadMap.country] = lead.account.country;
    if (salesforceLeadMap.url)
      encodedLead[salesforceLeadMap.url] = lead.account.url;
    if (salesforceLeadMap.zip_code)
      encodedLead[salesforceLeadMap.zip_code] = lead.account.zipcode;
    if (
      CompanyFieldMapHelper.getCompanySize({
        size: salesforceLeadMap?.size,
      })[0]
    )
      encodedLead[
        CompanyFieldMapHelper.getCompanySize({
          size: salesforceLeadMap.size,
        })[0]
      ] = lead.account.size;
    encodedLead.RingoverCadence__Has_Active_Cadence__c = true;
    encodedLead.OwnerId = salesforce_owner_id;

    // * Phone numbers and Emails
    lead.phone_numbers?.forEach((lead_phone_number) => {
      encodedLead[lead_phone_number.type] = lead_phone_number.phone_number;
    });
    lead.emails?.forEach((lead_email) => {
      encodedLead[lead_email.type] = lead_email.email_id;
    });

    encodedLead = clean(encodedLead);
    console.log('encoded lead', encodedLead);

    const [createdLead, errForCreatedLead] = await SalesforceService.createLead(
      encodedLead,
      salesforceLeadMap,
      access_token,
      instance_url
    );
    if (errForCreatedLead) {
      if (errForCreatedLead?.includes('DUPLICATES_DETECTED'))
        return [createdLead, 'Duplicate exists in salesforce.'];
      else if (errForCreatedLead?.toLowerCase()?.includes('country'))
        return [
          null,
          'Error while creating lead in salesforce: Salesforce doesn’t support the Country value. Please remove country and try again.',
        ];
      else
        return [
          null,
          `Error while creating lead in salesforce: ${errForCreatedLead}.`,
        ];
    }
    console.log('created SF Lead', JSON.stringify(createdLead, null, 2));

    lead.integration_id = createdLead.id;
    lead.salesforce_lead_id = createdLead.id;
    lead.integration_type = LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD;
    lead.account.integration_type =
      ACCOUNT_INTEGRATION_TYPES.SALESFORCE_LEAD_ACCOUNT;

    //Add Integration Status to Lead
    let salesforceLeadId = lead.integration_id;
    let integration_status = salesforceLeadMap.integration_status?.name
      ? `c.${salesforceLeadMap.integration_status?.name},`
      : '';
    let first_name = salesforceLeadMap.first_name
      ? `c.${salesforceLeadMap.first_name},`
      : '';
    let leadQuery = `SELECT+id,${first_name}${integration_status}ownerId,+c.Owner.Name+FROM+Lead+c+where+id+IN+('${salesforceLeadId}')`;
    logger.info(`leadQuery: ${leadQuery}`);

    let [leadFromSalesforce, errFetchingLeadFromSalesforce] =
      await SalesforceService.query(leadQuery, access_token, instance_url);
    if (errFetchingLeadFromSalesforce)
      return [null, errFetchingLeadFromSalesforce];
    if (!leadFromSalesforce.totalSize) return [null, 'Lead not found'];

    leadFromSalesforce = leadFromSalesforce.records[0];
    lead.integration_status =
      leadFromSalesforce?.[salesforceLeadMap?.integration_status?.name] ?? null;

    logger.info(
      `Created Lead: ${
        lead.first_name + ' ' + lead.last_name
      } with salesforce lead id: ${createdLead.id}.`
    );

    return [lead, null];
  } catch (err) {
    logger.error('Error while exporting lead to Salesforce: ', err);
    return [
      null,
      'Unable to create in salesforce. Please ensure field map is setup correctly and try again',
    ];
  }
};

module.exports = exportLeadToSalesforce;
