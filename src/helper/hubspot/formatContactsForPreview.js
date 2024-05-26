// * Utils
const logger = require('../../utils/winston');

const formatContactsForPreview = async ({
  hubspotContacts,
  hubspotContactMap,
  contactIntegrationIds,
  uniqueCompanyIds,
  uniqueHubspotOwnerIds,
  hubspotContactsInList,
}) => {
  try {
    for (let contact of hubspotContacts) {
      // * Store integration Ids
      contactIntegrationIds.push(contact.vid);

      // * Store uniqueCompanyIds
      if (
        contact.properties.associatedcompanyid &&
        contact.properties.associatedcompanyid.value !== ''
      )
        uniqueCompanyIds.push(contact.properties.associatedcompanyid.value);

      if (contact.properties.hubspot_owner_id)
        uniqueHubspotOwnerIds.push(contact.properties.hubspot_owner_id.value);

      let formattedContact = {
        first_name: contact.properties[hubspotContactMap.first_name]?.value,
        last_name: contact.properties[hubspotContactMap.last_name]?.value,
        linkedin_url: contact.properties[hubspotContactMap.linkedin_url]?.value,
        source_site: contact.properties[hubspotContactMap.source_site]?.value,
        job_position: contact.properties[hubspotContactMap.job_position]?.value,
        Id: contact.vid,
        phone_numbers: [],
        emails: [],
        associatedcompanyid: contact.properties.associatedcompanyid?.value,
        hubspot_owner_id: contact.properties.hubspot_owner_id?.value,
      };

      // * Process phone
      hubspotContactMap?.phone_numbers.forEach((phone_type) => {
        formattedContact.phone_numbers.push({
          type: phone_type,
          phone_number: contact.properties[phone_type]?.value || '',
        });
      });

      // * Process email
      hubspotContactMap?.emails.forEach((email_type) => {
        formattedContact.emails.push({
          type: email_type,
          email_id: contact.properties[email_type]?.value || '',
        });
      });

      hubspotContactsInList.push(formattedContact);
    }
    return [true, null];
  } catch (err) {
    logger.error('Error while formatting contacts for hubspot imports: ', err);
    return [null, err.message];
  }
};

module.exports = formatContactsForPreview;
