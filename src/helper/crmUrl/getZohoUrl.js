const logger = require('../../utils/winston');
const getZohoUrl = (lead) => {
  try {
    let zohoUrl = 'https://crm.zoho.com/crm/tab/Leads';
    if (lead.integration_id) zohoUrl += `/${lead.integration_id}`;
    else zohoUrl = '';

    return [zohoUrl, null];
  } catch (err) {
    logger.error('An error occurred while making zoho URL:', err);
    return [null, err];
  }
};

module.exports = getZohoUrl;
