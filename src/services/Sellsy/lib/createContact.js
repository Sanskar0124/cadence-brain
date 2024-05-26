// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const createContact = async ({ access_token, instance_url, contact }) => {
  try {
    const { data } = await axios.post(`${instance_url}/contacts`, contact, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    logger.error(
      `Error while creating contact for sellsy: ${
        err?.response?.data?.error?.message || err.message
      }`
    );
    return [null, err?.response?.data?.error?.message || err.message];
  }
};

module.exports = createContact;
