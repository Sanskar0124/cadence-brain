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

const exportCandidateToBullhorn = async ({
  access_token,
  instance_url,
  bullhornCandidateMap,
  candidate,
}) => {
  try {
    // * Encode Candidate
    let encodedCandidate = {};
    if (bullhornCandidateMap.first_name)
      encodedCandidate[bullhornCandidateMap.first_name] = candidate.first_name;
    if (bullhornCandidateMap.last_name)
      encodedCandidate[bullhornCandidateMap.last_name] = candidate.last_name;
    if (bullhornCandidateMap.job_position)
      encodedCandidate[bullhornCandidateMap.job_position] =
        candidate.job_position;
    if (bullhornCandidateMap.linkedin_url)
      encodedCandidate[bullhornCandidateMap.linkedin_url] =
        candidate.linkedin_url;

    if (bullhornCandidateMap.company)
      encodedCandidate[bullhornCandidateMap.company] = candidate.account.name;
    if (bullhornCandidateMap.url)
      encodedCandidate[bullhornCandidateMap.url] = candidate.account.url;
    if (bullhornCandidateMap.country) {
      let obj = encodedCandidate;
      let splitKeys = bullhornCandidateMap.country.split('.');
      for (let i = 0; i < splitKeys.length - 1; i++) {
        let key = splitKeys[i];
        if (obj[key] === undefined) obj[key] = {};
        obj = obj[key];
      }
      obj[splitKeys[splitKeys.length - 1]] = candidate.account.country;
    }
    if (bullhornCandidateMap.zip_code) {
      let obj = encodedCandidate;
      let splitKeys = bullhornCandidateMap.zip_code.split('.');
      for (let i = 0; i < splitKeys.length - 1; i++) {
        let key = splitKeys[i];
        if (obj[key] === undefined) obj[key] = {};
        obj = obj[key];
      }
      obj[splitKeys[splitKeys.length - 1]] = candidate.account.zipcode;
    }
    if (
      CompanyFieldMapHelper.getCompanySize({
        size: bullhornCandidateMap?.size,
      })[0]
    ) {
      try {
        candidate.account.size = parseInt(candidate.account.size);
        if (isNaN(candidate.account.size)) candidate.account.size = null;
        else
          encodedCandidate[
            CompanyFieldMapHelper.getCompanySize({
              size: bullhornCandidateMap?.size,
            })[0]
          ] = candidate.account.size;
      } catch (err) {
        logger.error('Unable to parse company size of account');
      }
    }

    // * Phone numbers
    candidate.phone_numbers?.forEach((candidate_phone_number) => {
      encodedCandidate[candidate_phone_number.type] =
        candidate_phone_number.phone_number;
    });

    // * Emails
    let lastEmailType;
    candidate.emails?.forEach((candidate_email) => {
      encodedCandidate[candidate_email.type] = candidate_email.email_id;
      lastEmailType = candidate_email.type;
    });
    if (!encodedCandidate.hasOwnProperty('email')) {
      encodedCandidate.email = candidate[lastEmailType];
      candidate.emails[candidate.emails.length - 1].type = 'email';
      delete candidate[lastEmailType];
    }

    // * Handle first_name, last_name for candidate as they are compulsory fields
    if (!encodedCandidate.hasOwnProperty('firstName'))
      encodedCandidate.firstName = candidate.first_name;
    if (!encodedCandidate.hasOwnProperty('lastName'))
      encodedCandidate.lastName = candidate.last_name;

    // * Create Candidate
    const [createdCandidate, errForCreatedCandidate] =
      await BullhornService.exportEntity({
        access_token,
        instance_url,
        object: BULLHORN_ENDPOINTS.CANDIDATE,
        body: encodedCandidate,
      });
    if (errForCreatedCandidate) return [null, errForCreatedCandidate];
    logger.info(
      `Created Candidate: ${
        candidate.first_name + ' ' + candidate.last_name
      } with bullhorn candidate id: ${createdCandidate.changedEntityId}.`
    );

    candidate.integration_id = createdCandidate.changedEntityId;
    candidate.integration_type = LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE;
    candidate.account.integration_type =
      ACCOUNT_INTEGRATION_TYPES.BULLHORN_CANDIDATE_ACCOUNT;

    return [candidate, null];
  } catch (err) {
    logger.error('Error while exporting candidate to bullhorn: ', err);
    return [
      null,
      'Unable to create candidate in bullhorn. Please ensure field map is setup correctly and try again',
    ];
  }
};

module.exports = exportCandidateToBullhorn;
