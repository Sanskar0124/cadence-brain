const getSalesforceUrl = (lead) => {
  let salesforceUrl = `https://ringover.lightning.force.com/lightning/r`;
  if (lead.salesforce_lead_id)
    salesforceUrl += `/Lead/${lead.salesforce_lead_id}/view`;
  else if (lead.salesforce_contact_id)
    salesforceUrl += `/Contact/${lead.salesforce_contact_id}/view`;
  else salesforceUrl = '';

  return [salesforceUrl, null];
};

module.exports = getSalesforceUrl;
