const logger = require('../../../utils/winston');
const axios = require('axios');
const { SALESFORCE_SERVICES_URL } = require('../../../utils/config');

const convertLead = async (salesforce_lead_id, access_token) => {
  try {
    let body = {
      leadId: salesforce_lead_id,
    };

    const URL = `${SALESFORCE_SERVICES_URL}/ConvertLead`;
    const response = await axios.post(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.data.status === 'success') {
      logger.info('Converted lead successfully');
    } else {
      logger.info('Convert failed');
    }
    console.log(response.data);
    return [true, null];
  } catch (err) {
    if (err?.response?.data?.errorMessage?.includes('DUPLICATES_DETECTED')) {
      logger.error('Duplicate is present. Resolve duplicates to convert');
      return [null, 'Duplicate is present therefore cannot convert.'];
    } else if (err?.response?.data?.errorCode === 'LEAD_NOT_FOUND') {
      logger.error(err?.response?.data?.errorMessage);
      return [null, err?.response?.data?.errorMessage];
    } else if (err?.response?.data?.errorCode === 'NOT_CONVERTED') {
      logger.error('Lead is probably already converted');
      return [null, 'Lead is probably already converted'];
    } else console.log(err?.response?.data);
    logger.error(`Error while converting lead: ${err.message}`);
    return [null, err.message];
  }
};

module.exports = { convertLead };
