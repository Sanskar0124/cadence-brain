// Packages
const logger = require('../../../utils/winston');
const axios = require('axios');

const search = async ({
  fields,
  start,
  count,
  object,
  query,
  access_token,
  instance_url,
}) => {
  try {
    const bullhornObject = object[0].toUpperCase() + object.substring(1);

    // Fetch sObject
    let URL = `${instance_url}/search/${bullhornObject}?fields=${fields}&count=100&start=${start}`;
    const { data } = await axios.post(
      URL,
      {
        query,
      },
      {
        headers: {
          BhRestToken: `${access_token}`,
        },
      }
    );
    return [data, null];
  } catch (err) {
    if (err?.response?.status === 504) {
      logger.error(
        `Error while running search query in bullhorn: ${JSON.stringify(
          err?.response?.data
        )}`
      );
      return [null, JSON.stringify(err?.response?.data)];
    }
    if (err?.response?.data) {
      logger.error(
        `Error while running search query in bullhorn: ${err?.response?.data?.errorMessage}`
      );
      return [null, err?.response?.data?.errorMessage];
    }
    logger.error(
      `Error while running search query in bullhorn: ${err.message}`
    );
    return [null, err.message];
  }
};

module.exports = {
  search,
};
