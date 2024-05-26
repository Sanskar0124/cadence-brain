// * Utils
const logger = require('../../utils/winston');

const formatContactsForPreview = async ({
  bullhornContacts,
  bullhornContactMap,
  contactIntegrationIds,
  uniqueAccountIds,
  uniqueBullhornOwnerIds,
  bullhornContactsInList,
}) => {
  try {
    for (let contact of bullhornContacts) {
      // * Store integration Ids
      contactIntegrationIds.push(contact.id);

      // * Store uniqueAccountIds
      if (contact.clientCorporation?.id)
        uniqueAccountIds.push(contact?.clientCorporation?.id.toString());

      if (contact.owner)
        uniqueBullhornOwnerIds.push(contact.owner.id.toString());

      let formattedContact = {
        first_name: contact[bullhornContactMap.first_name],
        last_name: contact[bullhornContactMap.last_name],
        linkedin_url: contact[bullhornContactMap.linkedin_url],
        source_site: contact[bullhornContactMap.source_site],
        job_position: contact[bullhornContactMap.job_position],
        integration_status:
          contact?.[bullhornContactMap?.integration_status?.name],
        Id: contact.id,
        phone_numbers: [],
        emails: [],
        associatedaccountid: contact?.clientCorporation?.id,
        Owner: {
          integration_id: contact?.owner?.id,
          first_name: contact?.owner?.firstName,
          last_name: contact?.owner?.lastName,
        },
      };

      // * Process phone
      bullhornContactMap?.phone_numbers.forEach((phone_type) => {
        formattedContact.phone_numbers.push({
          type: phone_type,
          phone_number: contact[phone_type] || '',
        });
      });

      // * Process email
      bullhornContactMap?.emails.forEach((email_type) => {
        formattedContact.emails.push({
          type: email_type,
          email_id: contact[email_type] || '',
        });
      });

      bullhornContactsInList.push(formattedContact);
    }
    return [true, null];
  } catch (err) {
    logger.error('Error while formatting contacts for bullhorn imports: ', err);
    return [null, err.message];
  }
};

module.exports = formatContactsForPreview;
