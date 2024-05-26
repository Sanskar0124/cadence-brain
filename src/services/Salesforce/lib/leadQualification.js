const axios = require('axios');
const logger = require('../../../utils/winston');

const getLeadQualification = async (
  salesforce_lead_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Lead/${salesforce_lead_id}`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    // console.log(data);
    return [data, null];
  } catch (err) {
    if (err.response.data)
      if (err.response.data[0].errorCode === 'NOT_FOUND')
        return [null, 'NOT_FOUND'];
    logger.error(
      `Error while fetching lead qualification info: ${err.message}`
    );
    return [null, err];
  }
};

const updateLeadQualification = async (
  salesforce_lead_id,
  body,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Lead/${salesforce_lead_id}`;
    const response = await axios.patch(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.status === 204) return [true, null];
    else return [null, response.data[0].message];
  } catch (err) {
    logger.error(
      `Error while updating lead qualification info: ${err.response.data[0].message}`
    );
    return [null, err.response.data[0].message];
  }
};

module.exports = {
  getLeadQualification,
  updateLeadQualification,
};
