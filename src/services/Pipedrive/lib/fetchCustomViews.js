//Uitls
const { PIPEDRIVE_MODULE } = require('../../../utils/enums');
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const fetchCustomViews = async ({ access_token, instance_url, moduleName }) => {
  try {
    if (!Object.values(PIPEDRIVE_MODULE).includes(moduleName))
      return [null, `Invalid Module Name ${moduleName}`];

    let URL = `${instance_url}/v1/filters?type=${moduleName}`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    if (err?.response?.data) {
      logger.error(
        'Error while fetching custom views from pipedrive:',
        JSON.stringify(err.response?.data[0])
      );
      return [null, JSON.stringify(err.response?.data[0])];
    }
    logger.error('Error while fetching custom views: ', err);
    return [null, err.message];
  }
};

module.exports = fetchCustomViews;
