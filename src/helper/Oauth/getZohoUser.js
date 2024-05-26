const logger = require('../../utils/winston');

// Packages
const axios = require('axios');

const getZohoUser = async (authData) => {
  try {
    const { access_token, api_domain } = authData;
    const { data } = await axios.get(
      `${api_domain}/crm/v2/users?type=CurrentUser`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const user = data?.users[0];
    return [user, null];
  } catch (err) {
    if (err?.response?.data) {
      logger.error(
        `An error occurred while getting Zoho user Id`,
        err?.response?.data
      );
      return [null, err?.response?.data];
    }
    logger.error(`An error occurred while getting Zoho user Id `, err);
    return [null, err.message];
  }
};

module.exports = getZohoUser;
