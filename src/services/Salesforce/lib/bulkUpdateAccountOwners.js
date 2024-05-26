// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const bulkUpdateAccountOwner = async (
  accounts,
  ownerId,
  access_token,
  instance_url
) => {
  try {
    let updatedAccounts = [];
    let requestBodies = [];
    const URL = `${instance_url}/services/data/v52.0/composite/sobjects`;

    // * Process accounts
    while (accounts.length > 0) {
      let chunk = accounts.splice(0, 199);

      let requestBody = {
        allOrNone: false,
      };

      let records = [];
      chunk.forEach((el) => {
        records.push({
          attributes: { type: 'Account' },
          id: el.salesforce_account_id ?? el.Id,
          OwnerId: ownerId,
        });
        updatedAccounts.push(el.account_id ?? el.Id);
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
    logger.info('Reassigned accounts in salesforce');

    return [updatedAccounts, null];
  } catch (err) {
    logger.error(
      `Error while updating bulk accounts in salesforce: ${err.message}`
    );
    return [null, err.message];
  }
};

module.exports = { bulkUpdateAccountOwner };
