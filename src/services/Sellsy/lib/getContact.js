const logger = require('../../../utils/winston');
const axios = require('axios');

const getContactCustomFields = async ({ contact_id, access_token, embed }) => {
  try {
    const URL = `https://api.sellsy.com/v2/contacts/${contact_id}?${embed}`;

    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [data, null];
  } catch (err) {
    const errorMessage = err?.response?.data?.error?.message || err.message;
    logger.error(
      `Error while fetching contact custom fields from sellsy: ${errorMessage}`
    );

    return [null, errorMessage];
  }
};

const getCompanyIdUsingContactId = async ({ access_token, contact_id }) => {
  try {
    const { data } = await axios.get(
      `https://api.sellsy.com/v2/contacts/${contact_id}/companies`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return [data?.data[0]?.id, null];
  } catch (err) {
    const errorMessage = err?.response?.data?.error?.message || err.message;
    logger.error(
      `Error while fetching account Id from sellsy: ${errorMessage}`
    );

    return [null, errorMessage];
  }
};

module.exports = { getContactCustomFields, getCompanyIdUsingContactId };
