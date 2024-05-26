// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const createContact = async ({ access_token, instance_url, contact }) => {
  try {
    const res = await axios.post(
      `${instance_url}/crm/v3/objects/contacts`,
      { properties: contact },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return [res, null];
  } catch (err) {
    if (err?.response?.data) {
      logger.error(
        `Error while creating contact in hubspot: ${err?.response?.data?.message}`
      );
      return [null, err?.response?.data?.message];
    }
    logger.error(`Error while creating contact in hubspot: ${err.message}`);
    return [null, err.message];
  }
};

module.exports = createContact;
