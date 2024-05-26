// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const bulkUpdateLeadOwner = async (
  leads,
  ownerId,
  access_token,
  instance_url
) => {
  try {
    let updatedLead = [];
    let requestBodies = [];

    const URL = `${instance_url}/services/data/v52.0/composite/sobjects`;

    // * Process leads
    while (leads.length > 0) {
      let chunk = leads.splice(0, 199);

      let requestBody = {
        allOrNone: false,
      };

      let records = [];

      chunk.forEach((el) => {
        records.push({
          attributes: { type: 'Lead' },
          id: el.salesforce_lead_id ?? el.Id,
          OwnerId: ownerId,
        });
        updatedLead.push(el.lead_id);
      });

      requestBody.records = records;
      requestBodies.push(requestBody);
    }
    // * Constructing promise
    const promiseArray = requestBodies.map((requestBody) =>
      axios.patch(URL, requestBody, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    );

    await Promise.all(promiseArray);
    logger.info('Reassigned leads in salesforce');

    return [updatedLead, null];
  } catch (err) {
    logger.error(
      `Error while updating bulk leads in salesforce: ${err.message}`
    );
    return [null, err.message];
  }
};

module.exports = { bulkUpdateLeadOwner };
