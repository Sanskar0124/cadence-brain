const logger = require('../../utils/winston');

// Packages
const axios = require('axios');

const getBullhornUser = async (authData) => {
  try {
    const { BhRestToken, restUrl } = authData;
    const { data } = await axios.get(
      `${restUrl}/settings/userId?BhRestToken=${BhRestToken}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return [data, null];
  } catch (err) {
    if (err?.response?.data) {
      logger.error(
        `An error occurred while getting Bullhorn user Id`,
        err?.response?.data
      );
      return [null, err?.response?.data];
    }
    logger.error(`An error occurred while getting Bullhorn user Id `, err);
    return [null, err.message];
  }
};

module.exports = getBullhornUser;
