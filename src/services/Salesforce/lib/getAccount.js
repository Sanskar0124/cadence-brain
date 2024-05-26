const logger = require('../../../utils/winston');
const axios = require('axios');

const getAccountFromSalesforce = async (
  salesforce_account_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Account/${salesforce_account_id}`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [data, null];
  } catch (err) {
    if (err.response.data) {
      if (err.response.data[0].errorCode === 'NOT_FOUND')
        return [null, 'Account not found.'];
    }
    logger.error(
      `Error while fetching account from salesforce: ${err.message}`
    );
    console.log(err.response.data);
    return [null, err.message];
  }
};

module.exports = { getAccountFromSalesforce };
