const axios = require('axios');
const logger = require('../../../utils/winston');

const getAccountTopics = async (
  salesforce_account_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/query?q=SELECT+TopicId+FROM+TopicAssignment+WHERE+EntityId+=%27${salesforce_account_id}%27`;
    const response = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.data.totalSize === 0) return [[], null];
    let i = 0;
    let records = response.data.records;
    let topicNames = [];
    while (i < response.data.totalSize) {
      let [topic, err] = await getTopicNameFromId(
        access_token,
        instance_url,
        records[i].TopicId
      );
      if (topic) topicNames.push(topic);
      i++;
      if (i === response.data.totalSize) {
        return [topicNames, null];
      }
    }
  } catch (err) {
    if (err.response.status === 400) {
      return [null, 'Given salesforce account id invalid.'];
    } else {
      console.log(
        'Error while fetching salesforce topics: ',
        err.response.data
      );
      return [null, 'Something went wrong with salesforce.'];
    }
  }
};

const getTopicNameFromId = async (access_token, instance_url, topic_id) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Topic/${topic_id}`;
    const response = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [response.data.Name, null];
  } catch (err) {
    console.log('Error while fetching topic name: ', err.response.data);
    return [null, 'Topic name not found'];
  }
};

module.exports = {
  getAccountTopics,
};
