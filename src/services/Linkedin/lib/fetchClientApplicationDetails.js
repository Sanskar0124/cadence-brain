// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');
const parser = require('node-html-parser');

const fetchClientApplicationDetails = async (headers) => {
  try {
    headers = {
      ...headers,
      'X-Li-User-Agent':
        'LIAuthLibrary:3.2.4 \
                            com.linkedin.LinkedIn:8.8.1 \
                            iPhone:8.3',
      'User-Agent': 'LinkedIn/8.8.1 CFNetwork/711.3.18 Darwin/14.0.0',
      'X-User-Language': 'en',
      'X-User-Locale': 'en_US',
      'Accept-Language': 'en-us',
      'Accept-Encoding': 'identity',
    };
    const res = await axios.get('https://linkedin.com', { headers });

    const htmldata = res.data;

    const clientPageInstanceId =
      parser
        .parse(htmldata)
        .querySelector("meta[name='clientPageInstanceId']")
        ?.getAttribute('content') || null;

    const applicationInstance =
      parser
        .parse(htmldata)
        .querySelector("meta[name='applicationInstance']")
        ?.getAttribute('content') || null;

    if (
      !clientPageInstanceId &&
      !applicationInstance['trackingId'] &&
      !applicationInstance['version']
    )
      return [null, `Required client application details not found.`];

    let result = {};

    result.clientPageInstanceId = clientPageInstanceId || null;
    result.applicationInstance = applicationInstance || {};
    return [{ clientPageInstanceId, applicationInstance }, null];
  } catch (err) {
    logger.error(`Error while fetching client application details: `, err);
    return [null, err.message];
  }
};

module.exports = fetchClientApplicationDetails;
