// * Utils
const logger = require('../../utils/winston');

const CompanyFieldMapHelper = require('../company-field-map');

const formatCandidatesForPreview = async ({
  bullhornCandidates,
  bullhornCandidateMap,
  candidateIntegrationIds,
  uniqueBullhornOwnerIds,
  bullhornCandidatesInList,
}) => {
  try {
    for (let candidate of bullhornCandidates) {
      // * Store integration Ids
      candidateIntegrationIds.push(candidate.id);

      if (candidate.owner)
        uniqueBullhornOwnerIds.push(candidate.owner.id.toString());

      let formattedCandidate = {
        first_name: candidate[bullhornCandidateMap.first_name],
        last_name: candidate[bullhornCandidateMap.last_name],
        linkedin_url: candidate[bullhornCandidateMap.linkedin_url],
        source_site: candidate[bullhornCandidateMap.source_site],
        job_position: candidate[bullhornCandidateMap.job_position],
        integration_status:
          candidate?.[bullhornCandidateMap?.integration_status?.name],
        Id: candidate.id,
        phone_numbers: [],
        emails: [],
        associatedaccountid: candidate?.clientCorporation?.id,
        Owner: {
          integration_id: candidate?.owner?.id,
          first_name: candidate?.owner?.firstName,
          last_name: candidate?.owner?.lastName,
        },
      };

      // * Process phone
      bullhornCandidateMap?.phone_numbers.forEach((phone_type) => {
        formattedCandidate.phone_numbers.push({
          type: phone_type,
          phone_number: candidate[phone_type] || '',
        });
      });

      // * Process email
      bullhornCandidateMap?.emails.forEach((email_type) => {
        formattedCandidate.emails.push({
          type: email_type,
          email_id: candidate[email_type] || '',
        });
      });
      if (candidate[bullhornCandidateMap?.company]) {
        formattedCandidate.Account = {
          name: candidate?.[bullhornCandidateMap?.company],
          size:
            candidate?.[
              CompanyFieldMapHelper.getCompanySize({
                size: bullhornCandidateMap?.size,
              })[0]
            ] ?? null,
          url: candidate?.[bullhornCandidateMap?.url] ?? null,
          country: candidate?.address?.countryName ?? null,
          zipcode: candidate?.address?.zip ?? null,
        };
      }

      bullhornCandidatesInList.push(formattedCandidate);
    }
    return [true, null];
  } catch (err) {
    logger.error(
      'Error while formatting candidates for bullhorn imports: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = formatCandidatesForPreview;
