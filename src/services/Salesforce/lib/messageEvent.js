const axios = require('axios');
const logger = require('../../../utils/winston');

const createMessageEvent = async (
  salesforce_lead_id,
  salesforce_owner_id,
  message,
  access_token,
  instance_url
) => {
  try {
    let body = {
      WhoId: salesforce_lead_id,
      Type: 'SMS',
      Subject: 'SMS',
      ActivityDate: new Date(),
      Status: 'Completed',
      OwnerId: salesforce_owner_id,
      Description: message,
    };

    const URL = `${instance_url}/services/data/v52.0/sobjects/Task`;
    const response = await axios.post(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.data.success) {
      logger.info('Salesforce message event created successfully');
      console.log(response.data);
      return [response.data.id, null];
    }
    logger.info('Salesforce message event creation failed');
    console.log(response.data.errors);
    return [false, response.data.errors];
  } catch (err) {
    if (err?.response?.data?.[0]?.errorCode === 'MALFORMED_ID') {
      logger.info('Salesforce lead/contact id is not valid');
      return [null, 'Ensure salesforce lead/contact id is valid'];
    }
    logger.error('Error while creating message event in salesforce: ', err);
    return [null, err.message];
  }
};

module.exports = { createMessageEvent };
