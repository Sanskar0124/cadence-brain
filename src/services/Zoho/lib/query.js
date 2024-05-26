// Packages
const logger = require('../../../utils/winston');
const axios = require('axios');

const query = async (query, access_token, instance_url) => {
  try {
    let URL = `${instance_url}/crm/v3/coql`;
    const { data } = await axios.post(
      URL,
      { select_query: query },
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
        `Error while running COQL query in zoho: `,
        err?.response?.data?.data?.[0]?.message
      );
      return [null, err?.response?.data?.data?.[0]?.message];
    } else if (err?.response?.data?.message) {
      logger.error(
        `Error while running COQL query in zoho: `,
        err?.response?.data?.message
      );
      return [null, err?.response?.data?.message];
    }
    logger.error(`Error while running COQL query in zoho: ${err.message}`);
    console.log(err.response.data);
    return [null, err.message];
  }
};

module.exports = { query };
