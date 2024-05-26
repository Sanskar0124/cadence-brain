// Packages
const logger = require('../../../utils/winston');
const axios = require('axios');

const getLeadsFromList = async (
  list_id,
  page_offset,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Lead/listviews/${list_id}/results/?offset=${page_offset}&limit=2000`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [data, null];
  } catch (err) {
    logger.error(
      `Error while fetching lead list from salesforce: ${err.message}`
    );
    if (err?.response?.data?.[0]?.message)
      return [null, err?.response?.data[0]?.message];
    return [null, err.message];
  }
};

module.exports = { getLeadsFromList };
