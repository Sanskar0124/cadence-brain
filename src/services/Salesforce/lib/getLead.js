const logger = require('../../../utils/winston');
const axios = require('axios');

const getLeadFromSalesforce = async (
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
    return [data, null];
  } catch (err) {
    if (err?.response?.data)
      if (err?.response?.data[0]?.errorCode === 'NOT_FOUND')
        return [null, 'Lead not found.'];

    logger.error(`Error while fetching lead from salesforce: `, err);
    return [null, err.message];
  }
};

module.exports = { getLeadFromSalesforce };
