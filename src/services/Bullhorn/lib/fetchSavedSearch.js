//Uitls
const { BULLHORN_IMPORT_SOURCE } = require('../../../utils/enums');
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const fetchSavedSearch = async ({
  access_token,
  instance_url,
  moduleName,
  offset,
}) => {
  try {
    if (!Object.values(BULLHORN_IMPORT_SOURCE).includes(moduleName))
      return [null, `Invalid Module Name ${moduleName}`];
    let sObject = moduleName.toUpperCase();
    let URL = `${instance_url}/savedSearch?type=${sObject}&count=50&start=${offset}`;
    const { data } = await axios.get(URL, {
      headers: {
        BhRestToken: `${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    if (err?.response?.data) {
      if (err?.response?.data?.[0]) {
        logger.error(
          'Error while fetching saved search from bullhorn:',
          JSON.stringify(err.response?.data[0]?.message)
        );
        return [null, JSON.stringify(err.response?.data[0]?.message)];
      }
      logger.error(
        'Error while fetching saved search from bullhorn:',
        JSON.stringify(err.response?.data?.message)
      );
      return [null, JSON.stringify(err.response?.data?.message)];
    }
    logger.error('Error while fetching saved search: ', err);
    return [null, err.message];
  }
};

module.exports = fetchSavedSearch;
