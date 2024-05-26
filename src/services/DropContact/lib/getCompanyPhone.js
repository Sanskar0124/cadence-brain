// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

// Helpers and services
const DelayHelper = require('../../../helper/delay');

const getCompanyPhone = async (companyName, DROPCONTACT_ACCESS_KEY) => {
  try {
    // body for request
    const body = {
      data: [
        {
          company: companyName,
        },
      ],
    };
    logger.info('Sending request for getting request number for company...');
    let URL = 'https://api.dropcontact.io/batch';
    let batchRequestIdResponse = await axios.post(URL, body, {
      headers: {
        'X-Access-Token': DROPCONTACT_ACCESS_KEY,
        'Content-Type': 'application/json',
      },
    });
    logger.info('Request for batch completed...');

    let batchRequestIdData = batchRequestIdResponse.data;
    if (batchRequestIdData.error)
      return [null, `Error fetching number from dropcontact.`];

    let batchRequestId = batchRequestIdData.request_id;
    let dataReceived = false;
    let requestData = {};
    let requestsPerformed = 0;

    while (!dataReceived) {
      if (requestsPerformed >= 3) {
        logger.error(`Result not found after 6 secs, Aborting process`);
        break;
      }

      logger.info('Fetching batch request result...');
      let batchRes = await axios.get(URL + `/${batchRequestId}`, {
        headers: {
          'X-Access-Token': DROPCONTACT_ACCESS_KEY,
          'Content-Type': 'application/json',
        },
      });
      logger.info('Received batch status!');
      let batchData = batchRes.data;
      requestsPerformed++;

      if (batchData.error) return [null, batchData.reason];
      else {
        if (batchData.success) {
          logger.info('Successfully received data!');
          dataReceived = true;
          requestData = batchData.data;
        } else {
          logger.info('Still processing, must wait...');
          await DelayHelper.delay(2000);
        }
      }
    }

    if (requestData?.length && requestData?.[0]?.phone) {
      logger.info('Company phone received.');
      return [requestData?.[0]?.phone, null];
    } else {
      logger.info(`Company phone not found.`);
      return [null, `Error fetching number from dropcontact.`];
    }
  } catch (err) {
    logger.error(`Error while fetching company phone: `, err);
    return [null, err.message];
  }
};

//getCompanyPhone('Acciolbis', 'ZfSUUDYTI8fpd0BSyfK2QVppTEQDxN');

module.exports = getCompanyPhone;
