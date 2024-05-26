const logger = require('../../utils/winston');
const getHubspotUrl = (portal_id, lead) => {
  try {
    let hubspotUrl = 'https://app.hubspot.com/contacts';
    if (lead.integration_id)
      hubspotUrl += `/${portal_id}/contact/${lead.integration_id}`;
    else hubspotUrl = '';

    return [hubspotUrl, null];
  } catch (err) {
    logger.error('An error occurred while making hubspot URL:', err);
    return [null, err];
  }
};

module.exports = getHubspotUrl;
