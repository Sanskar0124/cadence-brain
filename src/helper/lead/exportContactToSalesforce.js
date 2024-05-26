const logger = require('../../utils/winston');
const { clean } = require('../json');
const {
  LEAD_INTEGRATION_TYPES,
  ACCOUNT_INTEGRATION_TYPES,
} = require('../../utils/enums');

const SalesforceService = require('../../services/Salesforce');
const CompanyFieldMapHelper = require('../company-field-map');

const exportContactToSalesforce = async ({
  access_token,
  instance_url,
  salesforce_owner_id,
  salesforceContactMap,
  salesforceAccountMap,
  contact,
}) => {
  try {
    if (contact.account?.integration_id) {
      contact.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.SALESFORCE_ACCOUNT;
    } else {
      // * Encode Account
      let encodedAccount = {};
      if (salesforceAccountMap.name)
        encodedAccount[salesforceAccountMap.name] = contact.account.name;
      if (salesforceAccountMap.phone_number)
        encodedAccount[salesforceAccountMap.phone_number] =
          contact.account.phone_number;
      if (salesforceAccountMap.country)
        encodedAccount[salesforceAccountMap.country] = contact.account.country;
      if (salesforceAccountMap.url)
        encodedAccount[salesforceAccountMap.url] = contact.account.url;
      if (salesforceAccountMap.zip_code)
        encodedAccount[salesforceAccountMap.zip_code] = contact.account.zipcode;
      if (
        CompanyFieldMapHelper.getCompanySize({
          size: salesforceAccountMap?.size,
        })[0]
      )
        encodedAccount[
          CompanyFieldMapHelper.getCompanySize({
            size: salesforceAccountMap?.size,
          })[0]
        ] = contact.account.size;
      encodedAccount.OwnerId = salesforce_owner_id;
      logger.info(`account Obj SF: ${encodedAccount}`);

      // * Create Account
      const [createdAccount, errForCreatedAccount] =
        await SalesforceService.createAccount(
          encodedAccount,
          access_token,
          instance_url
        );
      if (errForCreatedAccount) return [null, errForCreatedAccount];

      contact.account.integration_id = createdAccount.id;
      contact.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.SALESFORCE_ACCOUNT;
    }

    // * Encode Contact
    let encodedContact = {};
    if (salesforceContactMap.first_name)
      encodedContact[salesforceContactMap.first_name] = contact.first_name;
    if (salesforceContactMap.last_name)
      encodedContact[salesforceContactMap.last_name] = contact.last_name;
    if (salesforceContactMap.job_position)
      encodedContact[salesforceContactMap.job_position] = contact.job_position;
    if (salesforceContactMap.linkedin_url)
      encodedContact[salesforceContactMap.linkedin_url] = contact.linkedin_url;
    encodedContact.OwnerId = salesforce_owner_id;
    encodedContact.RingoverCadence__Has_Active_Cadence__c = true;
    encodedContact.AccountId = contact.account.integration_id;

    // * Phone numbers and Emails
    contact.phone_numbers?.forEach((contact_phone_number) => {
      encodedContact[contact_phone_number.type] =
        contact_phone_number.phone_number;
    });
    contact.emails?.forEach((contact_email) => {
      encodedContact[contact_email.type] = contact_email.email_id;
    });

    // * Create Contact
    const [createdContact, errForCreatedContact] =
      await SalesforceService.createContact(
        encodedContact,
        access_token,
        instance_url
      );
    if (errForCreatedContact) return [null, errForCreatedContact];

    contact.integration_id = createdContact.id;
    contact.salesforce_contact_id = createdContact.id;
    contact.integration_type = LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT;

    //Add Integration Status to Contact
    let salesforceContactId = contact.integration_id;
    let account_integration_status = salesforceAccountMap.integration_status
      ?.name
      ? `c.Account.${salesforceAccountMap.integration_status?.name},`
      : '';
    let contactQuery = `SELECT+id,c.Account.Id,${account_integration_status} ownerId,+c.Owner.Name+FROM+Contact+c+where+id+IN+('${salesforceContactId}')`;
    logger.info(`contactQuery: ${contactQuery}`);

    let [contactFromSalesforce, errFetchingContactFromSalesforce] =
      await SalesforceService.query(contactQuery, access_token, instance_url);
    if (errFetchingContactFromSalesforce)
      return [null, errFetchingContactFromSalesforce];
    if (!contactFromSalesforce.totalSize) return [null, 'Contact not found'];

    contactFromSalesforce = contactFromSalesforce.records[0];
    contact.account.integration_status =
      contactFromSalesforce?.Account?.[
        salesforceAccountMap.integration_status?.name
      ] ?? null;

    logger.info(
      `Created Contact: ${
        contact.first_name + ' ' + contact.last_name
      } with salesforce contact id: ${createdContact.id}.`
    );

    return [contact, null];
  } catch (err) {
    logger.error('Error while exporting contact to Salesforce: ', err);
    return [
      null,
      'Unable to create contact in salesforce. Please ensure field map is setup correctly and try again',
    ];
  }
};

module.exports = exportContactToSalesforce;
