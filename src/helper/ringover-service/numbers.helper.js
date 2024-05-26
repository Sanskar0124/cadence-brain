// * Import Packages
const axios = require('axios');

// * Utils
const logger = require('../../utils/winston');

// * Helper Import
const regionURL = require('./region.helper');

const getNumbers = async ({ access_token, region }) => {
  try {
    // === DEBUG ===
    console.log('Access token ---> ' + access_token);
    console.log('region ---> ' + region);

    let response = await axios.get(`${regionURL(region)}/v3/numbers`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    let numbers = response.data.list;
    console.log('Found numbers ---> ' + numbers?.length);

    numbers = numbers.filter((number) => number.type === 'PHONE');
    response.data.list = numbers;

    return [response.data, null];
  } catch (err) {
    if (err?.response?.data)
      logger.error(
        `'An error occurred while fetching numbers from Ringover: ${JSON.stringify(
          err?.response?.data
        )}`
      );
    logger.error(
      'An error occurred while fetching numbers from Ringover: ',
      err
    );
    return [null, 'Unable to fetch numbers'];
  }
};

module.exports = {
  getNumbers,
};
