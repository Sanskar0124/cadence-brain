//Uitls
const { HUBSPOT_MODULE } = require('../../../utils/enums');
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const fetchCustomViews = async ({
  access_token,
  instance_url,
  moduleName,
  offset,
}) => {
  try {
    if (!Object.values(HUBSPOT_MODULE).includes(moduleName))
      return [null, `Invalid Module Name ${moduleName}`];
    let URL = `https://api.hubapi.com/${moduleName}/v1/lists?count=200&offset=${offset}`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [data, null];
  } catch (err) {
    if (err?.response?.data) {
      logger.error(
        'Error while fetching custom views from hubspot:',
        JSON.stringify(err?.response?.data)
      );
      return [null, JSON.stringify(err?.response?.data)];
    }
    logger.error('Error while fetching custom views: ', err);
    return [null, err.message];
  }
};

module.exports = fetchCustomViews;
