// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const createCompany = async ({ access_token, instance_url, company }) => {
  try {
    const { data } = await axios.post(`${instance_url}/companies`, company, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    logger.error(
      `Error while creating Company in sellsy: ${
        err?.response?.data?.error?.message || err.message
      }`
    );
    return [null, err?.response?.data?.error?.message || err.message];
  }
};

module.exports = createCompany;
