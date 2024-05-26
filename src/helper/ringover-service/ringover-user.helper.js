// * Import Packages
const axios = require('axios');

// * Utils
const logger = require('../../utils/winston');

// * Helper Import
const regionURL = require('./region.helper');

// * Fetch user from Ringover
const getUser = async ({ access_token, region }) => {
  try {
    let response = await axios.get(`${regionURL(region)}/v2/get/user`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    let user = response.data;
    return [user, null];
  } catch (err) {
    if (err?.response?.data)
      logger.error(
        `An error occurred while fetching user from Ringover: ${JSON.stringify(
          err?.response?.data
        )}`
      );
    else
      logger.error('An error occurred while fetching user from Ringover', err);
    return [null, 'Unable to fetch user from Ringover'];
  }
};

module.exports = getUser;
