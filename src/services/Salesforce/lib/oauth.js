const logger = require('../../../utils/winston');
const axios = require('axios');
const {
  //SALESFORCE_AUTH_URL,
  SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET,
  SALESFORCE_REDIRECT_URI,
} = require('../../../utils/config');

const getRedirectToUri = () => {
  try {
    let URL = `https://login.salesforce.com/services/oauth2/authorize?client_id=${SALESFORCE_CLIENT_ID}&redirect_uri=${SALESFORCE_REDIRECT_URI}&response_type=code`;
    return [URL, null];
  } catch (err) {
    logger.error(
      `Error while getting access token and instance url from salesforce auth: ${err.response.data}`
    );
    return [null, err.message];
  }
};

const getARTokenUsingCode = async (code) => {
  try {
    let URL = `https://login.salesforce.com/services/oauth2/token?client_id=${SALESFORCE_CLIENT_ID}&redirect_uri=${SALESFORCE_REDIRECT_URI}&grant_type=authorization_code&client_secret=${SALESFORCE_CLIENT_SECRET}&code=${code}`;
    const { data } = await axios.get(URL);
    return [data, null];
  } catch (err) {
    if (err.error_description === 'expired access/refresh token') {
      logger.error('Expired access/refresh token');
      return [null, err.error_description];
    }
    logger.error(`Error while getting AR token using code: ${err}`);
    return [null, err];
  }
};

module.exports = {
  getRedirectToUri,
  getARTokenUsingCode,
};
