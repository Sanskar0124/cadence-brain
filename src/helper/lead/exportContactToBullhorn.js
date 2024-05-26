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

const exportContactToBullhorn = async ({
  access_token,
  instance_url,
  bullhornContactMap,
  bullhornAccountMap,
  contact,
}) => {
  try {
    if (contact.account?.integration_id) {
      contact.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.BULLHORN_ACCOUNT;
    } else {
      // * Encode Account
      let encodedAccount = {};
      if (bullhornAccountMap.name)
        encodedAccount[bullhornAccountMap.name] = contact.account.name;
      if (bullhornAccountMap.phone_number)
        encodedAccount[bullhornAccountMap.phone_number] =
          contact.account.phone_number;
      if (bullhornAccountMap.url)
        encodedAccount[bullhornAccountMap.url] = contact.account.url;
      if (bullhornAccountMap.country) {
        let obj = encodedAccount;
        let splitKeys = bullhornAccountMap.country.split('.');
        for (let i = 0; i < splitKeys.length - 1; i++) {
          let key = splitKeys[i];
          if (obj[key] === undefined) obj[key] = {};
          obj = obj[key];
        }
        obj[splitKeys[splitKeys.length - 1]] = contact.account.country;
      }
      if (bullhornAccountMap.zip_code) {
        let obj = encodedAccount;
        let splitKeys = bullhornAccountMap.zip_code.split('.');
        for (let i = 0; i < splitKeys.length - 1; i++) {
          let key = splitKeys[i];
          if (obj[key] === undefined) obj[key] = {};
          obj = obj[key];
        }
        obj[splitKeys[splitKeys.length - 1]] = contact.account.zipcode;
      }
      if (
        CompanyFieldMapHelper.getCompanySize({
          size: bullhornAccountMap?.size,
        })[0]
      ) {
        try {
          contact.account.size = parseInt(contact.account.size);
          if (isNaN(contact.account.size)) contact.account.size = null;
          else
            encodedAccount[
              CompanyFieldMapHelper.getCompanySize({
                size: bullhornAccountMap?.size,
              })[0]
            ] = contact.account.size;
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

      contact.account.integration_id = createdAccount.changedEntityId;
      contact.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.BULLHORN_ACCOUNT;
      logger.info(
        `Created Account: ${contact.account.name} with bullhorn account id: ${createdAccount.changedEntityId}.`
      );
    }

    // * Encode Contact
    let encodedContact = {};
    if (bullhornContactMap.first_name)
      encodedContact[bullhornContactMap.first_name] = contact.first_name;
    if (bullhornContactMap.last_name)
      encodedContact[bullhornContactMap.last_name] = contact.last_name;
    if (bullhornContactMap.job_position)
      encodedContact[bullhornContactMap.job_position] = contact.job_position;
    if (bullhornContactMap.linkedin_url)
      encodedContact[bullhornContactMap.linkedin_url] = contact.linkedin_url;
    encodedContact.name = contact.first_name + ' ' + contact.last_name;
    encodedContact.clientCorporation = { id: contact.account.integration_id };

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
      await BullhornService.exportEntity({
        access_token,
        instance_url,
        object: BULLHORN_ENDPOINTS.CONTACT,
        body: encodedContact,
      });
    if (errForCreatedContact) return [null, errForCreatedContact];

    contact.integration_id = createdContact.changedEntityId;
    contact.integration_type = LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT;
    logger.info(
      `Created Contact: ${
        contact.first_name + ' ' + contact.last_name
      } with bullhorn contact id: ${createdContact.changedEntityId}.`
    );

    return [contact, null];
  } catch (err) {
    logger.error('Error while exporting contact to bullhorn: ', err);
    return [
      null,
      'Unable to create contact in bullhorn. Please ensure field map is setup correctly and try again',
    ];
  }
};

module.exports = exportContactToBullhorn;
