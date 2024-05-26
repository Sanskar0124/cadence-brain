// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const getSnovToken = async (snov_client_id, snov_client_secret) => {
  try {
    let body = {
      grant_type: 'client_credentials',
      client_id: snov_client_id,
      client_secret: snov_client_secret,
    };

    let res = await axios.post(
      'https://api.snov.io/v1/oauth/access_token',
      body
    );

    if (!res.data?.access_token)
      return [null, 'Failed to fetch snov access token.'];

    return [res.data.access_token, null];
  } catch (err) {
    logger.error(`Error while fetching snov token: ${err.message}`);
    return [null, err.message];
  }
};

module.exports = getSnovToken;
