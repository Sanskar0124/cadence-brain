const logger = require('../../utils/winston');

// Packages
const axios = require('axios');

const getPipedriveUser = async (req) => {
  try {
    const { data } = await axios.get(`${req.api_domain}/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${req.access_token}`,
      },
    });
    user = data.data;
    return [user, null];
  } catch (err) {
    logger.error(`Error while getting pipedrive USER id: `, err);
    return [null, err.message];
  }
};

module.exports = getPipedriveUser;
