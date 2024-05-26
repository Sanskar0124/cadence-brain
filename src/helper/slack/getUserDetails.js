//Utils
const logger = require('winston');
const { SLACK_USER_TOKEN } = require('../../utils/config');

//Packages
const axios = require('axios');

const getUserDetails = async (slack_user_id) => {
  try {
    const url = `https://slack.com/api/users.info?user=${slack_user_id}`;
    let response = await axios.get(url, {
      headers: {
        authorization: `Bearer ${SLACK_USER_TOKEN}`,
      },
    });
    if (response.data.ok == false) return [null, response.data.error];
    return [response.data.user, null];
  } catch (err) {
    logger.error('Error while getting user details:', err);
    return [null, err.message];
  }
};

module.exports = getUserDetails;
