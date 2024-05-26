// * Utils
const logger = require('../../utils/winston');

const formatLeadsForPreview = async ({
  bullhornLeads,
  bullhornLeadMap,
  leadIntegrationIds,
  uniqueAccountIds,
  uniqueBullhornOwnerIds,
  bullhornLeadsInList,
}) => {
  try {
    for (let lead of bullhornLeads) {
      // * Store integration Ids
      leadIntegrationIds.push(lead.id);

      // * Store uniqueAccountIds
      if (lead.clientCorporation?.id)
        uniqueAccountIds.push(lead?.clientCorporation?.id.toString());

      if (lead.owner) uniqueBullhornOwnerIds.push(lead.owner.id.toString());

      let formattedLead = {
        first_name: lead[bullhornLeadMap.first_name],
        last_name: lead[bullhornLeadMap.last_name],
        linkedin_url: lead[bullhornLeadMap.linkedin_url],
        source_site: lead[bullhornLeadMap.source_site],
        job_position: lead[bullhornLeadMap.job_position],
        integration_status: lead?.[bullhornLeadMap?.integration_status?.name],
        Id: lead.id,
        phone_numbers: [],
        emails: [],
        associatedaccountid: lead?.clientCorporation?.id,
        Owner: {
          integration_id: lead?.owner?.id,
          first_name: lead?.owner?.firstName,
          last_name: lead?.owner?.lastName,
        },
      };

      // * Process phone
      bullhornLeadMap?.phone_numbers.forEach((phone_type) => {
        formattedLead.phone_numbers.push({
          type: phone_type,
          phone_number: lead[phone_type] || '',
        });
      });

      // * Process email
      bullhornLeadMap?.emails.forEach((email_type) => {
        formattedLead.emails.push({
          type: email_type,
          email_id: lead[email_type] || '',
        });
      });

      bullhornLeadsInList.push(formattedLead);
    }
    return [true, null];
  } catch (err) {
    logger.error('Error while formatting leads for bullhorn imports: ', err);
    return [null, err.message];
  }
};

module.exports = formatLeadsForPreview;
