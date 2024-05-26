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

const exportContactToZoho = async ({
  access_token,
  instance_url,
  zohoContactMap,
  zohoAccountMap,
  contact,
}) => {
  try {
    if (contact.account?.integration_id) {
      contact.account.integration_type = ACCOUNT_INTEGRATION_TYPES.ZOHO_ACCOUNT;
    } else {
      // * Encode Account
      let encodedAccount = {};
      if (zohoAccountMap.name)
        encodedAccount[zohoAccountMap.name] = contact.account.name;
      if (zohoAccountMap.phone_number)
        encodedAccount[zohoAccountMap.phone_number] =
          contact.account.phone_number;
      if (zohoAccountMap.url)
        encodedAccount[zohoAccountMap.url] = contact.account.url;
      if (zohoAccountMap.country)
        encodedAccount[zohoAccountMap.country] = contact.account.country;
      if (zohoAccountMap.zip_code)
        encodedAccount[zohoAccountMap.zip_code] = `${contact.account.zipcode}`;
      if (
        CompanyFieldMapHelper.getCompanySize({
          size: zohoAccountMap?.size,
        })[0]
      ) {
        try {
          contact.account.size = parseInt(contact.account.size);
          if (isNaN(contact.account.size)) contact.account.size = null;
          else
            encodedAccount[
              CompanyFieldMapHelper.getCompanySize({
                size: zohoAccountMap.size,
              })[0]
            ] = `${contact.account.size}`;
        } catch (err) {
          logger.error('Unable to parse company size of account');
        }
      }

      encodedAccount = Object.entries(encodedAccount).reduce(
        (acc, [key, value]) => {
          if (value !== '') {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );
      logger.info(
        'Account obj zoho: ' + JSON.stringify(encodedAccount, null, 2)
      );

      // * Create Account
      const [createdAccount, errForCreatedAccount] =
        await ZohoService.createAccount({
          access_token,
          instance_url,
          account: { data: [encodedAccount] },
        });
      if (errForCreatedAccount) return [null, errForCreatedAccount];

      contact.account.integration_id = createdAccount.data[0].details.id;
      contact.account.integration_type = ACCOUNT_INTEGRATION_TYPES.ZOHO_ACCOUNT;
      logger.info(
        `Created Account: ${contact.account.name} with zoho account id: ${createdAccount.data[0].details.id}.`
      );
    }

    // * Encode Contact
    let encodedContact = {};
    if (zohoContactMap.first_name)
      encodedContact[zohoContactMap.first_name] = contact.first_name;
    if (zohoContactMap.last_name)
      encodedContact[zohoContactMap.last_name] = contact.last_name;
    if (zohoContactMap.job_position)
      encodedContact[zohoContactMap.job_position] = contact.job_position;
    if (zohoContactMap.linkedin_url)
      encodedContact[zohoContactMap.linkedin_url] = contact.linkedin_url;
    encodedContact.Account_Name = { id: contact.account.integration_id };

    // * Phone numbers and Emails
    contact.phone_numbers?.forEach((contact_phone_number) => {
      encodedContact[contact_phone_number.type] =
        contact_phone_number.phone_number;
    });
    contact.emails?.forEach((contact_email) => {
      encodedContact[contact_email.type] = contact_email.email_id;
    });

    // * Create Contact
    logger.info(`Contact obj: ${JSON.stringify(encodedContact, null, 2)}`);
    const [createdContact, errForCreatedContact] =
      await ZohoService.createContact({
        access_token,
        instance_url,
        contact: { data: [encodedContact] },
      });
    if (errForCreatedContact) return [null, errForCreatedContact];

    contact.integration_id = createdContact.data[0].details.id;
    contact.integration_type = LEAD_INTEGRATION_TYPES.ZOHO_CONTACT;
    logger.info(
      `Created Contact: ${
        contact.first_name + ' ' + contact.last_name
      } with zoho contact id: ${createdContact.data[0].details.id}.`
    );

    return [contact, null];
  } catch (err) {
    logger.error('Error while exporting contact to zoho: ', err);
    return [
      null,
      'Unable to create contact in zoho. Please ensure field map is setup correctly and try again',
    ];
  }
};

module.exports = exportContactToZoho;
