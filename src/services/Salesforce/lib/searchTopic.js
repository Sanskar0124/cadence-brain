// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const searchTopic = async ({ instance_url, access_token, topic }) => {
  try {
    if (!topic) return [null, 'Please provide a valid topic.'];

    topic = topic.replace(/-/g, '%2D');
    const URL = `${instance_url}/services/data/v52.0/query?q=SELECT+Id,+Name+FROM+Topic+WHERE+Name+LIKE%27%25${topic}%25%27`;
    // SELECT Id, Name FROM Topic WHERE Name LIKE '%search term%'

    const res = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { data } = res;
    if (data && data.records.length > 0) return [data.records, null];

    return [null, null];
  } catch (err) {
    logger.error(
      `Error while searching Salesforce topic: ${JSON.stringify(
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

module.exports = searchTopic;
