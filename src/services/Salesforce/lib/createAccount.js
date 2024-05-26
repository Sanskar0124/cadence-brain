// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const createAccount = async (account, access_token, instance_url) => {
  try {
    let res = await axios.post(
      `${instance_url}/services/data/v48.0/sobjects/Account`,
      account,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return [res.data, null];
  } catch (err) {
    logger.error(`Error data: ` + JSON.stringify(err?.response?.data, null, 4));
    if (err?.response?.data?.[0]?.errorCode === 'DUPLICATES_DETECTED') {
      logger.error(`Duplicate detected in salesforce.`);
      return [null, 'DUPLICATES_DETECTED'];
    }
    const msg = err?.response?.data?.[0]?.message ?? err.message;
    return [null, msg];
  }
};

module.exports = createAccount;
