const logger = require('../../../utils/winston');
const axios = require('axios');

const DisqualifyContact = async (
  disqualify_reason,
  salesforce_contact_id,
  access_token,
  instance_url
) => {
  try {
    logger.info(`Disqualifying contact: ${salesforce_contact_id}`);
    let body = {
      Motif_de_disqualification__c: disqualify_reason,
      Cadencetoolaccountdisqualify__c: true,
    };

    console.log(body);

    // Disqualify Contact in salesforce
    let URL = `${instance_url}/services/data/v52.0/sobjects/Contact/${salesforce_contact_id}`;
    const response = await axios.patch(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.status === 204) {
      logger.info('Disqualified contact successfully');
      return [true, null];
    }

    logger.error('Something went wrong while disqualifying contact');
    console.log(response.data[0].message);
    return [null, response.data[0].message];
  } catch (err) {
    logger.error(`Error while disqualifying contact: ${err.message}`);
    console.log(err.response.data);
    return [null, err.message];
  }
};

module.exports = {
  DisqualifyContact,
};
