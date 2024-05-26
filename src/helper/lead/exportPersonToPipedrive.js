// Utils
const logger = require('../../utils/winston');
const {
  LEAD_INTEGRATION_TYPES,
  ACCOUNT_INTEGRATION_TYPES,
} = require('../../utils/enums');

const PipedriveService = require('../../services/Pipedrive');
const CompanyFieldMapHelper = require('../company-field-map');

const exportPersonToPipedrive = async ({
  access_token,
  instance_url,
  pipedrivePersonMap,
  pipedriveOrganizationMap,
  person,
}) => {
  try {
    if (person.account.integration_id) {
      person.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.PIPEDRIVE_ORGANIZATION;
    } else {
      // * Encode organization data
      let encodedOrganization = {};
      if (pipedriveOrganizationMap.name)
        encodedOrganization[pipedriveOrganizationMap.name] =
          person.account.name;
      if (pipedriveOrganizationMap.phone_number)
        encodedOrganization[pipedriveOrganizationMap.phone_number] =
          person.account.phone_number;
      if (pipedriveOrganizationMap.linkedin_url)
        encodedOrganization[pipedriveOrganizationMap.linkedin_url] =
          person.account.linkedin_url;
      if (pipedriveOrganizationMap.country)
        encodedOrganization[pipedriveOrganizationMap.country] =
          person.account.country;
      if (pipedriveOrganizationMap.url)
        encodedOrganization[pipedriveOrganizationMap.url] = person.account.url;
      if (pipedriveOrganizationMap.zip_code)
        encodedOrganization[pipedriveOrganizationMap.zip_code] =
          person.account.zipcode;
      if (
        CompanyFieldMapHelper.getCompanySize({
          size: pipedriveOrganizationMap.size,
        })[0]
      )
        encodedOrganization[
          CompanyFieldMapHelper.getCompanySize({
            size: pipedriveOrganizationMap?.size,
          })[0]
        ] = person.account.size;
      logger.info(
        `Encoded Organization: ${JSON.stringify(encodedOrganization, null, 2)}`
      );

      // * Create Organization
      let [createdOrganization, errForCreatedOrganization] =
        await PipedriveService.createOrganization({
          access_token,
          instance_url,
          organization: encodedOrganization,
        });
      if (errForCreatedOrganization) return [null, errForCreatedOrganization];
      createdOrganization = createdOrganization.data;
      logger.info(
        `Organization created successfully: `,
        JSON.stringify(createdOrganization, null, 2)
      );

      person.account.integration_id = createdOrganization.id;
      person.account.integration_type =
        ACCOUNT_INTEGRATION_TYPES.PIPEDRIVE_ORGANIZATION;
    }

    // * Encode Person data
    let encodedPerson = {};
    if (pipedrivePersonMap.first_name)
      encodedPerson[pipedrivePersonMap.first_name] = person.first_name;
    if (pipedrivePersonMap.last_name)
      encodedPerson[pipedrivePersonMap.last_name] = person.last_name;
    if (pipedrivePersonMap.job_position)
      encodedPerson[pipedrivePersonMap.job_position] = person.job_position;
    if (pipedrivePersonMap.linkedin_url)
      encodedPerson[pipedrivePersonMap.linkedin_url] = person.linkedin_url;
    encodedPerson.name = `${person.first_name || ''} ${person.last_name || ''}`;
    encodedPerson.org_id = person.account.integration_id;

    // * Phone numbers and Emails
    let emails = [];
    let phone_numbers = [];
    person.emails?.forEach((email) => {
      emails.push({
        label: email.type,
        value: email.email_id,
      });
    });
    person.phone_numbers?.forEach((phone) => {
      phone_numbers.push({
        label: phone.type,
        value: phone.phone_number,
      });
    });
    if (emails?.length) encodedPerson[pipedrivePersonMap.emails] = emails;
    if (phone_numbers?.length)
      encodedPerson[pipedrivePersonMap.phone_numbers] = phone_numbers;
    logger.info(`Encoded Person: ${JSON.stringify(encodedPerson, null, 2)}`);

    // create person
    let [createdPerson, errForCreatedPerson] =
      await PipedriveService.createPerson({
        access_token,
        instance_url,
        person: encodedPerson,
      });
    if (errForCreatedPerson) return [null, errForCreatedPerson];
    createdPerson = createdPerson?.data;
    logger.info(
      `Person created successfully: ${JSON.stringify(createdPerson, null, 2)}`
    );

    person.integration_id = createdPerson.id;
    person.integration_type = LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON;

    return [person, null];
  } catch (err) {
    logger.error('Error while exporting person to pipedrive: ', err);
    return [
      null,
      'Unable to create person in pipedrive. Please ensure field map is setup correctly and try again',
    ];
  }
};

module.exports = exportPersonToPipedrive;
