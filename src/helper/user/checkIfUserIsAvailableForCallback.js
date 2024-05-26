// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repository
const Repository = require('../../repository');

// Helpers and Services
const Ringover = require('../../services/Ringover');

const checkIfUserIsAvailableForCallback = async ({ user_id }) => {
  try {
    //fetch user
    const [user, userErr] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: { user_id },
      extras: { attributes: ['ringover_user_id'] },
      include: {
        [DB_TABLES.USER_TOKEN]: {
          required: true,
          attributes: ['encrypted_ringover_api_key', 'ringover_api_key'],
        },
      },
    });
    if (userErr) return [null, userErr];
    if (!user) return [null, 'User not found'];

    if (!user.User_Token.ringover_api_key)
      return [null, 'Ringover API key not found'];
    if (!user.ringover_user_id)
      return [null, 'Ringover user id not found (user.ringover_user_id)'];

    //fetch presence
    const [presence, presenceErr] = await Ringover.User.getUserPresence({
      ringover_user_id: user.ringover_user_id,
      ringover_api_key: user.User_Token.ringover_api_key,
    });
    if (presenceErr) return [null, presenceErr];

    //check if user is available for callback
    if (!presence.in_call && !presence.is_snoozed) return [true, null];

    return [false, null];
  } catch (err) {
    logger.error(
      `Error while checking if user is available for callback: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = { checkIfUserIsAvailableForCallback };
