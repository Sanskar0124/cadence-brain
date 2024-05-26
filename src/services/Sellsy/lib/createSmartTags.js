// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const createSmartTags = async ({
  access_token,
  id,
  smart_tags,
  integration_type,
}) => {
  try {
    const { data } = await axios.post(
      `https://api.sellsy.com/v2/${integration_type}/${id}/smart-tags`,
      smart_tags,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return [data, null];
  } catch (err) {
    const errorMessage = err?.response?.data?.error?.message || err?.message;
    logger.error(`Error while creating smart tag in sellsy: ${errorMessage}`);
    return [null, errorMessage];
  }
};

module.exports = createSmartTags;
