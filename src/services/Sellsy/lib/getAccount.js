const logger = require('../../../utils/winston');
const axios = require('axios');

const getAccountCustomFields = async ({ access_token, company_id, embed }) => {
  try {
    const URL = `https://api.sellsy.com/v2/companies/${company_id}?${embed}`;

    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [data, null];
  } catch (err) {
    const errorMessage = err?.response?.data?.error?.message || err.message;
    logger.error(`Error while fetching account from sellsy: ${errorMessage}`);

    return [null, errorMessage];
  }
};

module.exports = getAccountCustomFields;
