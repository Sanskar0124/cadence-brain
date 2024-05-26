const logger = require('../../utils/winston');
const getSalesforceUrl = (instance_url, lead) => {
  try {
    let salesforceUrl = instance_url;
    if (lead.salesforce_lead_id)
      salesforceUrl += `/Lead/${lead.salesforce_lead_id}/view`;
    else if (lead.salesforce_contact_id)
      salesforceUrl += `/Contact/${lead.salesforce_contact_id}/view`;
    else salesforceUrl = '';

    return [salesforceUrl, null];
  } catch (err) {
    logger.error('An error occurred while making salesforce URL:', err);
    return [null, err];
  }
};

module.exports = getSalesforceUrl;
