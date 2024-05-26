const http = require('../utils/http');
const logger = require('../../../utils/winston');
const ROUTES = require('../constants/ROUTES');

const get = async (apiKey, user_id) => {
  try {
    user_id = user_id + 10000; // * Process for Public Ringover API
    const axios = http(apiKey);
    const response = await axios.get(ROUTES.GET_USER(user_id));
    if (response.status === 200) return [response.data, null];
    return [null, response.data];
  } catch (e) {
    logger.error(`Error while fetching ringover user: ${e.message}`);
    return [null, e.message];
  }
};

const getUserPresence = async ({ ringover_user_id, ringover_api_key }) => {
  try {
    ringover_user_id = ringover_user_id + 10000; // * Process for Public Ringover API
    const axios = http(ringover_api_key);
    const response = await axios.get(
      ROUTES.GET_USER_PRESENCE(ringover_user_id)
    );
    if (response.status === 200) return [response.data, null];
    return [null, response.data];
  } catch (err) {
    logger.error(
      `Error while fetching user presence:- ${err.message} ${JSON.stringify(
        err?.response?.data,
        null,
        2
      )}`
    );
    return [null, err.message];
  }
};

const User = { get, getUserPresence };

module.exports = User;
