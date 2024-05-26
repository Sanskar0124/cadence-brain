const logger = require('../../../utils/winston');
const axios = require('axios');
const {
  RINGOVER_API_URL,
  RINGOVER_API_US_URL,
} = require('../../../utils/config');
const http = require('../utils/http');
const ROUTES = require('../constants/ROUTES');

// * Helper Imports
const RingoverHelper = require('../../../helper/ringover-service');

const makeCall = async (from_number, to_number, ringover_api_key) => {
  try {
    let body = {
      from_number,
      to_number,
      timeout: 45,
      device: 'ALL',
    };

    let URL = `${RINGOVER_API_URL}/callback`;
    if (ringover_api_key.startsWith('US_'))
      URL = `${RINGOVER_API_US_URL}/callback`;

    const response = await axios.post(URL, body, {
      headers: {
        Authorization: ringover_api_key,
      },
    });
    if (response.status === 200) {
      logger.info('Call placed successfully');
      return [true, null];
    }
    logger.info('Call failed');
    return [false, response];
  } catch (err) {
    logger.error(`Error while placing call from ringover: ${err.message}`);
    return [false, err];
  }
};

const getCall = async ({ region, access_token, call_id }) => {
  try {
    let URL = `${RingoverHelper.regionURL(region)}/v3/calls/${call_id}`;

    const response = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.status !== 200) {
      throw new Error('Ringover call details failed to fetch.');
    }
    logger.info('Call fetched successfully.');
    return [response.data, null];
  } catch (err) {
    logger.error(`Error while fetching call from ringover: ${err.message}`);
    return [false, err.message];
  }
};

const createCallback = async ({
  from_number,
  to_number,
  timeout,
  device,
  ringover_api_key,
}) => {
  try {
    //console.logs here will be removed in next merge if everything goes well
    console.log(from_number, to_number, timeout, device, ringover_api_key);
    const modAxios = http(ringover_api_key);
    const response = await modAxios.post(ROUTES.CREATE_CALLBACK, {
      from_number,
      to_number,
      timeout,
      device,
    });
    if (response.status !== 200) {
      return [
        null,
        `Failed to create callback:- ${JSON.stringify(response.data, null, 2)}`,
      ];
    }
    logger.info(`Callback started successfully`);
    // will be removed in next merge if everything goes well
    console.log(response.data);
    return [response.data, null];
  } catch (err) {
    console.log(err);
    logger.error(
      `Error while creating callback:- ${err.message} ${JSON.stringify(
        err?.response?.data,
        null,
        2
      )}`
    );
    return [null, err.message];
  }
};

module.exports = { makeCall, getCall, createCallback };
