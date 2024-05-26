// Utils
const logger = require('../../../utils/winston');
const {
  LEAD_INTEGRATION_TYPES,
  ACCOUNT_INTEGRATION_TYPES,
} = require('../../../utils/enums');

const HubspotService = require('../../../services/Hubspot');
const CompanyFieldMapHelper = require('../../company-field-map');

const exportContactToHubspot = async ({
  access_token,
  instance_url,
  hubspot_owner_id,
  hubspotContactMap,
  hubspotCompanyMap,
  contact,
}) => {
  try {
    if (contact.account.integration_id) {
      contact.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.HUBSPOT_COMPANY;
    } else {
      // * Encode Company data
      let encodedCompany = {};
      if (hubspotCompanyMap.name)
        encodedCompany[hubspotCompanyMap.name] = contact.account.name;
      if (hubspotCompanyMap.phone_number)
        encodedCompany[hubspotCompanyMap.phone_number] =
          contact.account.phone_number;
      if (hubspotCompanyMap.linkedin_url)
        encodedCompany[hubspotCompanyMap.linkedin_url] =
          contact.account.linkedin_url;
      if (hubspotCompanyMap.country)
        encodedCompany[hubspotCompanyMap.country] = contact.account.country;
      if (hubspotCompanyMap.url)
        encodedCompany[hubspotCompanyMap.url] = contact.account.url;
      if (hubspotCompanyMap.zip_code)
        encodedCompany[hubspotCompanyMap.zip_code] = contact.account.zipcode;
      if (
        CompanyFieldMapHelper.getCompanySize({
          size: hubspotCompanyMap.size,
        })[0]
      )
        encodedCompany[
          CompanyFieldMapHelper.getCompanySize({
            size: hubspotCompanyMap?.size,
          })[0]
        ] = contact.account.size;
      encodedCompany.hubspot_owner_id = hubspot_owner_id;
      logger.info(
        `Encoded Company: ${JSON.stringify(encodedCompany, null, 2)}`
      );

      // * Create Company
      let [createdCompany, errForCreatedCompany] =
        await HubspotService.createCompany({
          access_token,
          instance_url,
          company: {
            properties: encodedCompany,
          },
        });
      if (errForCreatedCompany) return [null, errForCreatedCompany];
      logger.info(
        `Company created successfully: ${JSON.stringify(
          createdCompany,
          null,
          2
        )}`
      );

      contact.account.integration_id = createdCompany.id;
      contact.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.HUBSPOT_COMPANY;
    }

    // * Encode contact data
    let encodedContact = {};
    if (hubspotContactMap.first_name)
      encodedContact[hubspotContactMap.first_name] = contact.first_name;
    if (hubspotContactMap.last_name)
      encodedContact[hubspotContactMap.last_name] = contact.last_name;
    if (hubspotContactMap.job_position)
      encodedContact[hubspotContactMap.job_position] = contact.job_position;
    if (hubspotContactMap.linkedin_url)
      encodedContact[hubspotContactMap.linkedin_url] = contact.linkedin_url;
    encodedContact.associatedcompanyid = contact.account.integration_id;
    encodedContact.hubspot_owner_id = hubspot_owner_id;

    // * Phone numbers and Emails
    contact.phone_numbers?.forEach((contact_phone_number) => {
      encodedContact[contact_phone_number.type] =
        contact_phone_number.phone_number;
    });
    contact.emails?.forEach((contact_email) => {
      encodedContact[contact_email.type] = contact_email.email_id;
    });
    logger.info(`Encoded contact: ${JSON.stringify(encodedContact, null, 2)}`);

    // create contact
    let [createdContact, errForCreatedContact] =
      await HubspotService.createContact({
        access_token,
        instance_url,
        contact: encodedContact,
      });
    if (errForCreatedContact) return [null, errForCreatedContact];
    createdContact = createdContact?.data;
    logger.info(
      `Contact created successfully: ${JSON.stringify(createdContact, null, 2)}`
    );

    contact.integration_id = createdContact.id;
    contact.integration_type = LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT;

    return [contact, null];
  } catch (err) {
    logger.error('Error while exporting contact to hubspot: ', err);
    return [
      null,
      'Unable to create contact in hubspot. Please ensure field map is setup correctly and try again',
    ];
  }
};

module.exports = exportContactToHubspot;
