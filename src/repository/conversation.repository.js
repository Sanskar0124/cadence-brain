// Utils
const logger = require('../utils/winston');

// Models
const { Conversation } = require('../db/models');

const findOrCreate = async ({
  user_id,
  lead_id,
  from_phone_number,
  conv_id,
  cadence_id,
}) => {
  try {
    let query = null;
    if (cadence_id)
      query = { conv_id, user_id, lead_id, from_phone_number, cadence_id };
    else query = { conv_id, user_id, lead_id, from_phone_number };

    const data = await Conversation.findOrCreate({
      where: query,
      // defaults: { conv_id },
    });
    return [data, null];
  } catch (err) {
    logger.error(
      `Error while finding or creating conversation: ${err.message}`
    );
    return [null, err.message];
  }
};

const getConvId = async ({ user_id, lead_id, from_phone_number }) => {
  try {
    const data = await Conversation.findOne({
      where: { user_id, lead_id, from_phone_number },
    });
    if (data) return [data.conv_id, null];
    return [null, null];
  } catch (err) {
    logger.error(`Error while fetching conversation: ${err.message}`);
    return [null, err.message];
  }
};

const getConversation = async (conv_id) => {
  try {
    const data = await Conversation.findOne({
      where: { conv_id },
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while getting conversation: ${err.message}`);
    return [null, err.message];
  }
};

const deleteConversation = async (query) => {
  try {
    const data = await Conversation.destroy({
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting conversation: ${err.message}`);
    return [null, err.message];
  }
};

const ConversationRepository = { findOrCreate, getConvId, getConversation };

module.exports = ConversationRepository;
