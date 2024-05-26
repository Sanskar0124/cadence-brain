// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const getTopicByName = async ({ instance_url, access_token, topic }) => {
  try {
    if (!topic) return [null, 'Please provide a valid topic.'];

    topic = topic.replace(/-/g, '%2D');
    const URL = `${instance_url}/services/data/v52.0/query?q=SELECT+Id,+Name+FROM+Topic+WHERE+Name+=%27${topic}%27`;
    // SELECT Id, Name FROM Topic WHERE Name '2022-sales'

    const res = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { data } = res;
    if (data && data.records.length > 0) return [data.records[0], null];

    return [null, null];
  } catch (err) {
    logger.error(
      `Error while getting topic by name: ${JSON.stringify(
        err.response.data,
        null,
        4
      )}`,
      err
    );
    const msg = err?.response?.data?.[0]?.message ?? err.message;
    return [null, msg];
  }
};

module.exports = getTopicByName;
