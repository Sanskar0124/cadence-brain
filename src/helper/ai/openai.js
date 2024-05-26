// * Utils
const logger = require('../../utils/winston');
const { OPENAI_API_KEY } = require('../../utils/config');
const { CHAT_GPT_TURBO_MODEL } = require('../../utils/constants');

// * Packages
const { Configuration, OpenAIApi } = require('openai');

/**
 * @description this helper allows to interact with the open ai chat completion endpoint
 * @param {array} messages - [{ role: 'user', content: 'Hello world' }]
 */
const openAiRequest = async (messages) => {
  try {
    // * Initialize configuration
    const configuration = new Configuration({
      apiKey: OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const chatCompletion = await openai.createChatCompletion({
      model: CHAT_GPT_TURBO_MODEL,
      messages,
    });

    return [chatCompletion.data.choices[0].message.content, null];
  } catch (err) {
    if (err.response)
      logger.error(
        `Error while fetching openAI response: ${JSON.stringify(
          err?.response?.data
        )}`
      );
    else logger.error(`Error while fetching openAI response: `, err);

    return [null, err.message];
  }
};

module.exports = openAiRequest;
