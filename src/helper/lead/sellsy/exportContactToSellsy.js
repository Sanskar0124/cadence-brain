// * Utils
const logger = require('../../../utils/winston');
const {
  LEAD_INTEGRATION_TYPES,
  ACCOUNT_INTEGRATION_TYPES,
} = require('../../../utils/enums');

// * Helpers and services
const SellsyService = require('../../../services/Sellsy');
const CompanyFieldMapHelper = require('../../company-field-map');

const exportContactToSellsy = async ({
  access_token,
  instance_url,
  sellsyContactMap,
  sellsyCompanyMap,
  sellsy_owner_id,
  contact,
}) => {
  try {
    let encodedCompany = {};
    if (sellsyCompanyMap?.name)
      encodedCompany[sellsyCompanyMap.name] = contact.account?.name?.trim();
    if (sellsyCompanyMap?.phone_number)
      encodedCompany[sellsyCompanyMap.phone_number] =
        contact.account?.phone_number?.trim() || null;
    if (sellsyCompanyMap?.url)
      encodedCompany[sellsyCompanyMap.url] =
        contact.account?.url?.trim() || null;
    if (
      CompanyFieldMapHelper.getCompanySize({
        size: sellsyCompanyMap?.size,
      })[0]
    ) {
      try {
        contact.account.size = parseInt(contact.account?.size?.trim());
        if (isNaN(contact.account.size)) contact.account.size = null;
        else
          encodedCompany[
            CompanyFieldMapHelper.getCompanySize({
              size: sellsyCompanyMap.size,
            })[0]
          ] = contact.account.size;
      } catch (err) {
        logger.error('Unable to parse company size of account');
      }
    }

    // * Handle number_of_employees.label separately
    if (encodedCompany.hasOwnProperty('number_of_employees.label')) {
      encodedCompany.number_of_employees =
        encodedCompany['number_of_employees.label'];
      delete encodedCompany['number_of_employees.label'];
    }

    if (contact.account?.integration_id) {
      contact.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.SELLSY_COMPANY;

      // * Update Company
      const [updatedCompany, errForUpdatedCompany] =
        await SellsyService.updateCompany({
          access_token,
          instance_url,
          company_id: contact.account.integration_id,
          company: encodedCompany,
        });
      if (errForUpdatedCompany) return [null, errForUpdatedCompany];
      logger.info(
        `Company created successfully: ${JSON.stringify(
          updatedCompany?.id,
          null,
          2
        )}`
      );
    } else {
      // * Encode Company
      encodedCompany.type = 'prospect';
      encodedCompany.owner_id = parseInt(sellsy_owner_id);
      logger.info('Company obj: ' + JSON.stringify(encodedCompany, null, 2));

      // * Create Company
      const [createdCompany, errForCreatedCompany] =
        await SellsyService.createCompany({
          access_token,
          instance_url,
          company: encodedCompany,
        });
      if (errForCreatedCompany) return [null, errForCreatedCompany];
      logger.info(
        `Company created successfully: ${JSON.stringify(
          createdCompany?.id,
          null,
          2
        )}`
      );

      let zipcode = contact.account?.zipcode;
      let country = contact.account?.country;
      if (zipcode?.length || country?.length) {
        // * Update country and zipcode separately
        let companyData = {};
        companyData.country = zipcode?.length ? zipcode?.trim() : 'NA';
        companyData.postal_code = country?.length ? country?.trim() : 'NA';
        companyData.name = 'Address';
        companyData.address_line_1 =
          zipcode?.length && country?.length
            ? `${contact.account?.zipcode?.trim()}, ${contact.account?.country?.trim()}`
            : 'NA';
        companyData.city = 'NA';
        companyData.country_code = 'NA';
        logger.info(
          'Company address obj: ' + JSON.stringify(companyData, null, 2)
        );
        const [companyAddress, errForCompanyAddress] =
          await SellsyService.createCompanyAddress({
            access_token,
            instance_url,
            company: companyData,
            company_id: createdCompany.id,
          });
        if (errForCompanyAddress) return [null, errForCompanyAddress];
        logger.info(
          `address created successfully: ${JSON.stringify(
            companyAddress?.id,
            null,
            2
          )}`
        );
      }
      contact.account.integration_id = createdCompany.id;
      contact.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.SELLSY_COMPANY;
    }

    // * Encode Contact
    let encodedContact = {};
    if (sellsyContactMap?.first_name)
      encodedContact[sellsyContactMap.first_name] = contact.first_name?.trim();
    if (sellsyContactMap?.last_name)
      encodedContact[sellsyContactMap.last_name] = contact.last_name?.trim();
    if (sellsyContactMap?.job_position)
      encodedContact[sellsyContactMap.job_position] =
        contact?.job_position?.trim() || null;
    if (sellsyContactMap?.linkedin_url) {
      if (sellsyContactMap.linkedin_url?.includes('.')) {
        let objectKeys = sellsyContactMap.linkedin_url.split('.');
        encodedContact[objectKeys[0]] = {
          [objectKeys[1]]: contact?.linkedin_url?.trim() || null,
        };
      } else
        encodedContact[sellsyContactMap.linkedin_url] =
          contact?.linkedin_url?.trim() || null;
    }

    // * Phone numbers and Emails
    contact.phone_numbers?.forEach((contact_phone_number) => {
      encodedContact[contact_phone_number.type] =
        contact_phone_number.phone_number?.trim() || null;
    });
    contact.emails?.forEach((contact_email) => {
      encodedContact[contact_email.type] =
        contact_email.email_id?.trim() || null;
    });

    encodedContact.owner_id = parseInt(sellsy_owner_id);
    // * Create Contact
    logger.info(`Contact obj: ${JSON.stringify(encodedContact, null, 2)}`);
    const [createdContact, errForCreatedContact] =
      await SellsyService.createContact({
        access_token,
        instance_url,
        contact: encodedContact,
      });
    if (errForCreatedContact) return [null, errForCreatedContact];
    logger.info(
      `Contact created successfully: ${JSON.stringify(
        createdContact?.id,
        null,
        2
      )}`
    );

    // * Link the contact to the company
    let [errForLinkContact] = await SellsyService.linkContact({
      access_token,
      instance_url,
      contact_id: createdContact.id,
      company_id: contact.account.integration_id,
    });
    if (errForLinkContact) return [null, errForLinkContact];
    logger.info(`Contact linked with Company successfully`);

    contact.integration_id = createdContact?.id?.toString();
    contact.account.integration_id = contact.account.integration_id.toString();
    contact.integration_type = LEAD_INTEGRATION_TYPES.SELLSY_CONTACT;

    return [contact, null];
  } catch (err) {
    logger.error('Error while exporting contact to sellsy: ', err);
    return [
      null,
      'Unable to create contact in sellsy. Please ensure field map is setup correctly and try again',
    ];
  }
};

module.exports = exportContactToSellsy;
