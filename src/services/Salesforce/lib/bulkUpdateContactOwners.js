// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const bulkUpdateContactOwner = async (
  contacts,
  ownerId,
  access_token,
  instance_url
) => {
  try {
    // * Process contacts
    let updatedContact = [];
    let requestBodies = [];

    const URL = `${instance_url}/services/data/v52.0/composite/sobjects`;

    while (contacts.length > 0) {
      let chunk = contacts.splice(0, 199);

      let requestBody = {
        allOrNone: false,
      };

      let records = [];

      chunk.forEach((el) => {
        records.push({
          attributes: { type: 'Contact' },
          id: el.salesforce_contact_id ?? el.Id ?? el.integration_id,
          OwnerId: ownerId,
        });
        updatedContact.push(el.lead_id ?? el.Id);
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
    logger.info('Reassigned contacts in salesforce');

    return [updatedContact, null];
  } catch (err) {
    logger.error(
      `Error while updating bulk contacts in salesforce: ${err.message}`
    );
    return [null, err.message];
  }
};

module.exports = { bulkUpdateContactOwner };
