// Packages
const axios = require('axios');

// Utils
const logger = require('../../utils/winston');

const getOpportunityMetrics = async ({ instance_url, access_token }) => {
  try {
    const URL = `${instance_url}/services/apexrest/RingoverCadence/Metrics`;
    const response = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [response.data, null];
  } catch (err) {
    logger.error(`An error occurred while getting opportunity metrics: `, err);
    if (err?.response?.data) return [null, err.response.data];
    return [null, err.message];
  }
};

module.exports = getOpportunityMetrics;
