const logger = require('../../../utils/winston');
const axios = require('axios');

const checkIfAccessTokenIsValid = async (access_token) => {
  try {
    let URL = `https://login.salesforce.com/services/oauth2/userinfo`;
    const res = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (res.status === 200) return [true, null];
    else return [false, null];
  } catch (err) {
    if (err.response.data === 'Bad_OAuth_Token') return [false, null];
    logger.error(
      `Error while checking if access token is valid: ${err.response.data}`
    );
    console.log(err.response.data);
    return [null, err.message];
  }
};

module.exports = checkIfAccessTokenIsValid;
