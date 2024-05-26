// Utils
const logger = require('../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../utils/enums');

// Services
const salesforceService = require('../../services/Salesforce');

//helpers
const getCompanySize = require('../company-field-map/getCompanySize');
const AccessTokenHelper = require('../access-token');

// * Run SOQL query to fetch required lead fields
const queryLeads = async (
  lead_ids,
  access_token,
  instance_url,
  selectLeadQuery
) => {
  try {
    let leadQuery = `${selectLeadQuery}+IN+(${lead_ids})`;
    let [leadsFromSalesforce, errFetchingLeadsFromSalesforce] =
      await salesforceService.query(leadQuery, access_token, instance_url);
    if (errFetchingLeadsFromSalesforce)
      return [null, errFetchingLeadsFromSalesforce];

    return [leadsFromSalesforce.records, null];
  } catch (err) {
    logger.error(
      `An error ocurred while trying to run SOQL query to fetch leads: ${err.message}`
    );
    return [null, err.message];
  }
};

// * Get lead data from salesforce
const getSalesforceLeadDataFromList = async ({
  user_id,
  list_id,
  salesforceLeadMap,
}) => {
  try {
    // * Fetch access token
    let [{ access_token, instance_url }, errFetchingAccessToken] =
      await AccessTokenHelper.getAccessToken({
        integration_type: CRM_INTEGRATIONS.SALESFORCE,
        user_id,
      });
    if (errFetchingAccessToken) return [{}, errFetchingAccessToken];

    let size = true;
    let i = 0;
    let leads = [];
    let leadIdList = [];
    let lead_ids = '';

    // * Query Construction
    let first_name = salesforceLeadMap.first_name
      ? `c.${salesforceLeadMap.first_name},`
      : '';
    let last_name = salesforceLeadMap.last_name
      ? `c.${salesforceLeadMap.last_name},`
      : '';
    let linkedin_url = salesforceLeadMap.linkedin_url
      ? `c.${salesforceLeadMap.linkedin_url},`
      : '';
    let source_site = salesforceLeadMap.source_site
      ? `c.${salesforceLeadMap.source_site},`
      : '';
    let job_position = salesforceLeadMap.job_position
      ? `c.${salesforceLeadMap.job_position},`
      : '';

    let company = salesforceLeadMap.company
      ? `c.${salesforceLeadMap.company},`
      : '';
    let company_phone_number = salesforceLeadMap.company_phone_number
      ? `c.${salesforceLeadMap.company_phone_number},`
      : '';

    let lead_company_size = getCompanySize({
      size: salesforceLeadMap?.size,
    })[0]
      ? `c.${
          getCompanySize({
            size: salesforceLeadMap?.size,
          })[0]
        },`
      : '';

    let zip_code = salesforceLeadMap.zip_code
      ? `c.${salesforceLeadMap.zip_code},`
      : '';

    let country = salesforceLeadMap.country
      ? `c.${salesforceLeadMap.country},`
      : '';

    let integration_status = salesforceLeadMap.integration_status?.name
      ? `c.${salesforceLeadMap.integration_status?.name},`
      : '';

    let url = salesforceLeadMap.url ? `c.${salesforceLeadMap.url},` : '';

    let phone_number_query = '';
    salesforceLeadMap?.phone_numbers.forEach((phone_type) => {
      if (phone_number_query) phone_number_query += `c.${phone_type},`;
      else phone_number_query = `c.${phone_type},`;
    });
    let email_query = '';
    salesforceLeadMap?.emails.forEach((email_type) => {
      if (email_query) email_query += `c.${email_type},`;
      else email_query = `c.${email_type},`;
    });

    let selectLeadQuery = `SELECT+id,${first_name}${company}${company_phone_number}${linkedin_url}${phone_number_query}${email_query}${lead_company_size}${zip_code}${country}${url}${source_site}${job_position}${last_name}${integration_status}ownerId,+c.Owner.Name+FROM+Lead+c+where+id`;

    while (size) {
      if (i > 2000) return [{}, 'List is too large to import'];

      let [list, errFetchingLeadListFromSalesforce] =
        await salesforceService.getLeadsFromList(
          list_id,
          i,
          access_token,
          instance_url
        );
      if (errFetchingLeadListFromSalesforce)
        return [{}, errFetchingLeadListFromSalesforce];

      list = list.records;
      size = list.length;

      if (size === 0) {
        const [leadsFromQuery, errFetchingLeadsFromQuery] = await queryLeads(
          lead_ids,
          access_token,
          instance_url,
          selectLeadQuery
        );
        if (leads.length === 0 && leadsFromQuery == null)
          return [{}, 'No leads found'];
        if (errFetchingLeadsFromQuery) return [{}, errFetchingLeadsFromQuery];
        leads = [...leads, ...leadsFromQuery];
        break;
      }

      for (let l of list) {
        let leadId = l.columns.filter((c) => c.fieldNameOrPath === 'Id')[0]
          .value;

        if (lead_ids.length === 0) lead_ids = "'" + leadId.trim() + "'";
        else if (lead_ids.length > 9000) {
          lead_ids = lead_ids + ',' + "'" + leadId.trim() + "'";
          let [leadsFromQuery, errFetchingLeadsFromQuery] = await queryLeads(
            lead_ids,
            access_token,
            instance_url,
            selectLeadQuery
          );
          if (errFetchingLeadsFromQuery) return [{}, errFetchingLeadsFromQuery];
          leads = [...leads, ...leadsFromQuery];
          lead_ids = '';
        } else lead_ids = lead_ids + ',' + "'" + leadId.trim() + "'";
        leadIdList.push(leadId.trim());
      }

      i = i + 2000;
    }

    return [
      {
        leadIdList,
        leads,
        instance_url,
      },
      null,
    ];
  } catch (err) {
    logger.error(
      `An error occurred while trying to fetch lead list data from salesforce: `,
      err
    );
    return [{}, err.message];
  }
};

module.exports = getSalesforceLeadDataFromList;
