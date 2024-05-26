const logger = require('../../utils/winston');

const SalesforceService = require('../../services/Salesforce');

const createAndLinkTopics = async ({
  topics,
  instance_url,
  access_token,
  entityId,
  search = true,
}) => {
  try {
    if (!topics) return [null, "'topics' should be an array."];

    for (const topic of topics) {
      let topicData = null,
        errForTopicData = null;

      // search topic
      if (search)
        [topicData, errForTopicData] = await SalesforceService.searchTopic({
          instance_url,
          access_token,
          topic,
        });

      // continue;

      if (!topicData) {
        // create topic
        [topicData, errForTopicData] = await SalesforceService.createTopic({
          instance_url,
          access_token,
          topicName: topic,
        });
        if (topicData) topicData.Id = topicData.id;
        if (errForTopicData) continue;
      }

      // link topic with entity
      const [linkData, errForTopicLink] =
        await SalesforceService.linkTopicToEntity({
          instance_url,
          access_token,
          topicId: topicData.Id,
          entityId,
        });
      if (errForTopicLink) continue;
    }

    return [true, null];
  } catch (err) {
    logger.error('Error while creating and linking topics in SF: ', err);
    return [null, err.message];
  }
};

module.exports = createAndLinkTopics;
