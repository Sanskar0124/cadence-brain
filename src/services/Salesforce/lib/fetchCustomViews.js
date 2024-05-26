//Uitls
const { SALESFORCE_MODULE } = require('../../../utils/enums');
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
    if (!Object.values(SALESFORCE_MODULE).includes(moduleName))
      return [null, `Invalid Module Name ${moduleName}`];
    let sObject = moduleName[0].toUpperCase() + moduleName.substring(1);
    let URL = `${instance_url}/services/data/v58.0/sobjects/${sObject}/listviews?offset=${offset}&limit=200`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    if (err?.response?.data) {
      logger.error(
        'Error while fetching custom views from salesforce:',
        JSON.stringify(err.response?.data[0]?.message)
      );
      return [null, JSON.stringify(err.response?.data[0]?.message)];
    }
    logger.error('Error while fetching custom views: ', err);
    return [null, err.message];
  }
};

module.exports = fetchCustomViews;
