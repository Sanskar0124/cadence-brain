// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const getNetworkInfo = async (headers, public_id) => {
  try {
    const res = await axios.get(
      `https://www.linkedin.com/voyager/api/identity/profiles/${public_id}/networkinfo`,
      {
        headers,
      }
    );
    const data = res.data;
    return [data, null];
  } catch (err) {
    logger.error(`Error while fetching my profile: `, err);
    return [null, err.message];
  }
};

module.exports = getNetworkInfo;
