// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const linkContact = async ({
  access_token,
  instance_url,
  contact_id,
  company_id,
}) => {
  try {
    const { data } = await axios.post(
      `${instance_url}/companies/${company_id}/contacts/${contact_id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return [data, null];
  } catch (err) {
    logger.error(
      `Error while linking contact for sellsy: ${
        err?.response?.data?.error?.message || err.message
      }`
    );
    return [null, err?.response?.data?.error?.message || err.message];
  }
};

module.exports = linkContact;
