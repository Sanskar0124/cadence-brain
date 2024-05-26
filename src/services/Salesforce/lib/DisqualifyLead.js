const logger = require('../../../utils/winston');
const axios = require('axios');

const DisqualifyLead = async (
  disqualify_reason,
  salesforce_lead_id,
  access_token,
  instance_url
) => {
  try {
    let body = {
      status: 'Unqualified',
      LostReasons__c: disqualify_reason,
    };

    console.log(body);

    // Creating EmailMessage in salesforce
    let URL = `${instance_url}/services/data/v52.0/sobjects/Lead/${salesforce_lead_id}`;
    const response = await axios.patch(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.status === 204) {
      logger.info('Disqualified lead successfully');
      return [true, null];
    }

    logger.error('Something went wrong while disqualifying lead');
    if (response.data) {
      console.log(response.data[0].message);
      return [null, response.data[0].message];
    }
    return [null, 'Something went wrong'];
  } catch (err) {
    logger.error(`Error while disqualifying lead: ${err.message}`);
    if (err.response) {
      console.log(err.response.data);
    }
    return [null, err.message];
  }
};

module.exports = {
  DisqualifyLead,
};
