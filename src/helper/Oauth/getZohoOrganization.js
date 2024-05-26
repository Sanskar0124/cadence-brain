const logger = require('../../utils/winston');

// Packages
const axios = require('axios');

const getZohoOrganization = async (authData) => {
  try {
    const { access_token, api_domain } = authData;
    const { data } = await axios.get(`${api_domain}/crm/v3/org`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const org = data;
    return [org, null];
  } catch (err) {
    if (err?.response?.data) {
      logger.error(
        `An error occurred while getting Zoho organization Id`,
        err?.response?.data
      );
      return [null, err?.response?.data];
    }
    logger.error(`An error occurred while getting Zoho organization Id `, err);
    return [null, err.message];
  }
};

module.exports = getZohoOrganization;
