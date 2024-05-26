// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const linkTopicToEntity = async ({
  instance_url,
  access_token,
  topicId,
  entityId,
}) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/TopicAssignment`;
    const body = {
      TopicId: topicId,
      EntityId: entityId,
    };

    const res = await axios.post(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [res.data, null];
  } catch (err) {
    logger.error(
      `Error while linking topic with entity in Salesforce:  ${JSON.stringify(
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

module.exports = linkTopicToEntity;
