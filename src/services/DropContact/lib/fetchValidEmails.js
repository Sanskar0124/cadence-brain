// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

// Helpers and services
const DelayHelper = require('../../../helper/delay');

const fetchLeadEmail = async ({
  first_name,
  last_name,
  dropcontact_api_key,
  linkedinUrl = '',
  accountName = '',
  accountUrl = '',
}) => {
  try {
    // body for request
    const body = {
      data: [
        {
          first_name,
          last_name,
          linkedinUrl,
          company: accountName,
          website: accountUrl,
        },
      ],
      language: 'en',
    };

    const URL = 'https://api.dropcontact.io/batch';
    const batchResponse = await axios.post(URL, body, {
      headers: {
        'X-Access-Token': dropcontact_api_key,
        'Content-Type': 'application/json',
      },
    });

    let batchRequestIdData = batchResponse.data;
    if (batchRequestIdData.error)
      return [null, 'Error fetching email from Dropcontact.'];

    let batchRequestId = batchRequestIdData.request_id;
    let dataReceived = false;
    let requestData = null;
    let requestsPerformed = 0;

    await DelayHelper.delay(1500);

    while (!dataReceived) {
      if (requestsPerformed >= 5) {
        logger.error(`No data found from Dropcontact, aborting process.`);
        break;
      }

      const batchRes = await axios.get(`${URL}/${batchRequestId}`, {
        headers: {
          'X-Access-Token': dropcontact_api_key,
          'Content-Type': 'application/json',
        },
      });
      let batchData = batchRes.data;
      requestsPerformed++;

      if (batchData.error) return [null, batchData.reason];
      else {
        if (batchData.success) {
          dataReceived = true;
          requestData = batchData.data;
        } else await DelayHelper.delay(2000);
      }
    }

    if (requestData?.[0]?.email?.length) {
      const emails = requestData[0].email?.map((emailObj) => emailObj.email);
      return [emails, null];
    } else return [null, 'No emails found from Dropcontact'];
  } catch (err) {
    logger.error(`Error while fetching dropcontact email: `, err);
    return [null, err.message];
  }
};

module.exports = fetchLeadEmail;
