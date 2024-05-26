// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const createTopic = async ({ access_token, instance_url, topicName }) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Topic`;
    const topic = {
      Name: topicName,
    };

    const res = await axios.post(URL, topic, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [res.data, null];
  } catch (err) {
    logger.error(
      `Error while creating topic in Salesforce:  ${JSON.stringify(
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

module.exports = createTopic;
