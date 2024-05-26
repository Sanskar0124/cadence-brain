// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const getMyProfile = async (headers) => {
  try {
    const res = await axios.get('https://www.linkedin.com/voyager/api/me', {
      headers,
    });
    const data = res.data;
    //console.log(JSON.stringify(data, null, 4));
    return [data, null];
  } catch (err) {
    logger.error(`Error while fetching my profile: `, err);
    return [null, err?.message];
  }
};

module.exports = getMyProfile;
