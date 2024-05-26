// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const createAccount = async ({
  access_token,
  instance_url,
  account,
  query,
}) => {
  try {
    let URL = `${instance_url}/api/data/v9.2/accounts`;
    if (query) URL = `${URL}?${query}`;

    const { data } = await axios.post(URL, account, {
      headers: {
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        Prefer: 'return=representation',
        // 'MSCRM.SuppressDuplicateDetection': 'true',
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    logger.error(
      `Error while creating Account in dynamics: ${
        err.response.data.error.message || err.message
      }`
    );
    return [null, err.message];
  }
};

module.exports = createAccount;
