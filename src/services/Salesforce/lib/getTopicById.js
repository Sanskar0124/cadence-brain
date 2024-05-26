// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const getTopicById = async (access_token, instance_url, topicId) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Topic/${topicId}`;
    const res = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [res.data, null];
  } catch (err) {
    logger.error(
      `Error while getting topic from Id in Salesforce:  ${JSON.stringify(
        err?.response?.data,
        null,
        4
      )}`,
      err
    );
    const msg = err?.response?.data?.[0]?.message ?? err.message;
    return [null, msg];
  }
};

module.exports = getTopicById;
