// Utils
const logger = require('../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../utils/enums');

// Services
const salesforceService = require('../../services/Salesforce');

// Helpers
const getCompanySize = require('../company-field-map/getCompanySize');
const AccessTokenHelper = require('../access-token');

// * Run SOQL query to fetch required contact fields
const queryContacts = async (
  contact_ids,
  access_token,
  instance_url,
  selectContactQuery
) => {
  try {
    let contactQuery = `${selectContactQuery}+IN+(${contact_ids})`;
    let [contactsFromSalesforce, errFetchingContactsFromSalesforce] =
      await salesforceService.query(contactQuery, access_token, instance_url);
    if (errFetchingContactsFromSalesforce) {
      logger.info('brain/errFetchingContactsFromSalesforce====> ');
      logger.info(JSON.stringify(errFetchingContactsFromSalesforce));
      return [null, errFetchingContactsFromSalesforce];
    }
    return [contactsFromSalesforce.records, null];
  } catch (err) {
    logger.error(
      `An error ocurred while trying to run SOQL query to fetch contacts: `,
      err
    );
    return [null, err.message];
  }
};

// * Get contact data from salesforce
const getSalesforceContactDataFromList = async ({
  user_id,
  list_id,
  salesforceContactMap,
  salesforceAccountMap,
}) => {
  try {
    // * Fetch access token
    let [{ access_token, instance_url }, errFetchingAccessToken] =
      await AccessTokenHelper.getAccessToken({
        integration_type: CRM_INTEGRATIONS.SALESFORCE,
        user_id,
      });
    if (errFetchingAccessToken) {
      logger.info('brain/errFetchingAccessToken====> ');
      logger.info(JSON.stringify(errFetchingAccessToken));
      return [{}, errFetchingAccessToken];
    }

    let size = true;
    let i = 0;
    let contacts = [];
    let contactIdList = [];
    let contact_ids = '';

    // * Query Construction
    let first_name = salesforceContactMap.first_name
      ? `c.${salesforceContactMap.first_name},`
      : '';
    let last_name = salesforceContactMap.last_name
      ? `c.${salesforceContactMap.last_name},`
      : '';
    let linkedin_url = salesforceContactMap.linkedin_url
      ? `c.${salesforceContactMap.linkedin_url},`
      : '';
    let source_site = salesforceContactMap.source_site
      ? `c.${salesforceContactMap.source_site},`
      : '';
    let job_position = salesforceContactMap.job_position
      ? `c.${salesforceContactMap.job_position},`
      : '';
    let contact_integration_status = salesforceContactMap.integration_status
      ?.name
      ? `c.${salesforceContactMap.integration_status?.name},`
      : '';

    let phone_number_query = '';
    salesforceContactMap?.phone_numbers.forEach((phone_type) => {
      if (phone_number_query) phone_number_query += `c.${phone_type},`;
      else phone_number_query = `c.${phone_type},`;
    });
    let email_query = '';
    salesforceContactMap?.emails.forEach((email_type) => {
      if (email_query) email_query += `c.${email_type},`;
      else email_query = `c.${email_type},`;
    });

    // * Construct query for account
    let account_name = salesforceAccountMap.name
      ? `c.Account.${salesforceAccountMap.name},`
      : '';
    let account_url = salesforceAccountMap.url
      ? `c.Account.${salesforceAccountMap.url},`
      : '';
    let account_size = getCompanySize({
      size: salesforceAccountMap?.size,
    })[0]
      ? `c.Account.${
          getCompanySize({
            size: salesforceAccountMap?.size,
          })[0]
        },`
      : '';
    let account_country = salesforceAccountMap.country
      ? `c.Account.${salesforceAccountMap.country},`
      : '';
    let zip_code = salesforceAccountMap.zip_code
      ? `c.Account.${salesforceAccountMap.zip_code},`
      : '';
    let account_linkedin_url = salesforceAccountMap.linkedin_url
      ? `c.Account.${salesforceAccountMap.linkedin_url},`
      : '';
    let account_phone_number = salesforceAccountMap.phone_number
      ? `c.Account.${salesforceAccountMap.phone_number},`
      : '';
    let account_integration_status = salesforceAccountMap.integration_status
      ?.name
      ? `c.Account.${salesforceAccountMap.integration_status?.name},`
      : '';

    let selectContactQuery = `SELECT+id,${first_name}${linkedin_url}${source_site}${job_position}${contact_integration_status}${last_name}${phone_number_query}${email_query}${account_name}c.Account.Id,${account_url}${account_size}${account_country}${zip_code}${account_linkedin_url}${account_phone_number}${account_integration_status} ownerId,+c.Owner.Name+FROM+Contact+c+where+id`;

    while (size) {
      if (i > 2000) return [{}, 'List is too large to import'];

      let [list, errFetchingContactListFromSalesforce] =
        await salesforceService.getContactsFromList(
          list_id,
          i,
          access_token,
          instance_url
        );
      if (errFetchingContactListFromSalesforce) {
        logger.info('brain/errFetchingContactListFromSalesforce====> ');
        logger.info(JSON.stringify(errFetchingContactListFromSalesforce));
        return [{}, errFetchingContactListFromSalesforce];
      }
      list = list.records;
      size = list.length;

      if (size === 0) {
        const [contactsFromQuery, errFetchingContactsFromQuery] =
          await queryContacts(
            contact_ids,
            access_token,
            instance_url,
            selectContactQuery
          );
        if (contacts.length === 0 && contactsFromQuery == null)
          return [{}, 'No contacts found'];
        if (errFetchingContactsFromQuery) {
          logger.info('brain/errFetchingContactsFromQuery====> ');
          logger.info(JSON.stringify(errFetchingContactsFromQuery));
          return [{}, errFetchingContactsFromQuery];
        }
        contacts = [...contacts, ...contactsFromQuery];
        break;
      }

      for (let l of list) {
        let contactId = l.columns.filter((c) => c.fieldNameOrPath === 'Id')[0]
          .value;

        if (contact_ids.length === 0)
          contact_ids = "'" + contactId.trim() + "'";
        else if (contact_ids.length > 9000) {
          contact_ids = contact_ids + ',' + "'" + contactId.trim() + "'";
          let [contactsFromQuery, errFetchingContactsFromQuery] =
            await queryContacts(
              contact_ids,
              access_token,
              instance_url,
              selectContactQuery
            );
          if (errFetchingContactsFromQuery) {
            logger.info('brain/errFetchingContactsFromQuery====> ');
            logger.info(JSON.stringify(errFetchingContactsFromQuery));
            return [{}, errFetchingContactsFromQuery];
          }
          contacts = [...contacts, ...contactsFromQuery];
          contact_ids = '';
        } else contact_ids = contact_ids + ',' + "'" + contactId.trim() + "'";
        contactIdList.push(contactId.trim());
      }

      i = i + 2000;
    }

    return [
      {
        contactIdList,
        contacts,
        instance_url,
      },
      null,
    ];
  } catch (err) {
    logger.error(
      `An error occurred while trying to fetch contact list data from salesforce: `,
      err
    );
    return [{}, err.message];
  }
};

module.exports = getSalesforceContactDataFromList;
