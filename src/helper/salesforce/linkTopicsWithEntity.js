const logger = require('../../utils/winston');

const SalesforceService = require('../../services/Salesforce');

const linkTopicsWithEntity = async ({
  topicIds,
  instance_url,
  access_token,
  entityId,
}) => {
  try {
    if (!topicIds) return [null, "'topicIds' should be an array."];

    for (const topicId of topicIds) {
      const [linkData, errForTopicLink] =
        await SalesforceService.linkTopicToEntity({
          instance_url,
          access_token,
          topicId,
          entityId,
        });
      if (errForTopicLink) continue;
    }

    return [true, null];
  } catch (err) {
    logger.error('Error while linking topics with entity in SF: ', err);
    return [null, err.message];
  }
};

module.exports = linkTopicsWithEntity;
