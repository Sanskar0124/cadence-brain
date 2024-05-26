// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const searchAccount = async ({ access_token, instance_url, accountName }) => {
  try {
    const { data } = await axios.get(
      `${instance_url}/crm/v4/Accounts/search?criteria=(Account_Name:starts_with:${accountName})`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return [data, null];
  } catch (err) {
    if (err?.response?.data?.data?.[0]?.message) {
      logger.error(
        'Error while searching Account in zoho: ',
        err?.response?.data?.data?.[0]?.message
      );
      return [null, err?.response?.data?.data?.[0]?.message];
    } else if (err?.response?.data?.message) {
      logger.error(
        `Error while searching Account in zoho: `,
        err?.response?.data?.message
      );
      return [null, err?.response?.data?.message];
    }
    logger.error('Error while searching Account in zoho: ', err);
    return [null, err.message];
  }
};

module.exports = searchAccount;
