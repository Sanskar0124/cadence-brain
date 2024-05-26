const logger = require('../../../utils/winston');
const axios = require('axios');

const mergeDuplicates = async (
  salesforce_lead_id,
  duplicate_ids,
  access_token
) => {
  try {
    let i = 0;
    while (i < duplicate_ids.length) {
      let body = {
        masterId: salesforce_lead_id,
        duplicateId: duplicate_ids[i],
      };

      const URL = `${SALESFORCE_SERVICES_URL}/MergeLead`;
      const response = await axios.post(URL, body, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (response.data.status === 'success') {
        logger.info('Merged duplicate successfully');
      } else {
        logger.info('Merge failed');
      }
      console.log(response.data);
      ++i;
      if (i === duplicate_ids.length) {
        if (response.data.leadId !== null) return [response.data.leadId, null];
        else return [response.data.leadId, response.data.errorMessage];
      }
    }
  } catch (err) {
    console.log(err.response.data);
    logger.error(err.message);
    return [null, err];
  }
};

module.exports = { mergeDuplicates };
