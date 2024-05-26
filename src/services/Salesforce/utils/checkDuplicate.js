const logger = require('../../../utils/winston');
const axios = require('axios');

const checkDuplicates = async (
  salesforce_lead_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/apexrest/RingoverCadence/DuplicateAccountContact?recordId=${salesforce_lead_id}`;
    const response = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (response.data.status === 'success') {
      if (response.data.duplicates.length === 0) return [false, null];
      else return [true, null];
    } else {
      logger.info('Error checking for duplicates');
      console.log(response.data);
    }
    return [false, response.data.errorMessage];
  } catch (err) {
    if (err?.response?.data?.duplicates === null) return [false, null];
    logger.error(
      'Error while checking for salesforce duplicates: ',
      err.message
    );
    return [null, err];
  }
};

const getDuplicates = async (
  salesforce_lead_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/apexrest/RingoverCadence/DuplicateAccountContact?recordId=${salesforce_lead_id}`;
    const response = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (response.data.status === 'success') {
      if (response.data.duplicates.length === 0) return [null, null];
      else return [response.data.duplicates, null];
    } else {
      logger.info('Error checking for duplicates');
      logger.info(response.data.errorMessage);
    }
    return [null, response.data.errorMessage];
  } catch (err) {
    if (err.response.status === 404) return [[], null];
    logger.error(err.message);
    if (err.response.data.status === 'error')
      return [null, err.response.data.errorMessage];

    return [null, err.message];
  }
};

module.exports = {
  checkDuplicates,
  getDuplicates,
};
