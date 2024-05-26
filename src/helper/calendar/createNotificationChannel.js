// Utils
const logger = require('../../utils/winston');

// Repositories
const UserTokenRepository = require('../../repository/user-token.repository');

// Helpers and services
const CryptoHelper = require('../crypto');
const Events = require('../../services/Google/Calendar/lib/Events');

const createCalendarChannel = async (user_id, refresh_token) => {
  const [channelId] = await Events.createNotificationChannel(refresh_token);
  logger.info(`Channel created=> ${channelId}`);
  // await UserRepository.updateUserById(
  //   { google_calendar_channel_id: channelId },
  //   user_id
  // );

  const [
    encryptedGoogleCalendarChannelId,
    errForEncryptedGoogleCalendarChannelId,
  ] = CryptoHelper.encrypt(channelId);

  await UserTokenRepository.updateUserTokenByQuery(
    { user_id },
    {
      encrypted_google_calendar_channel_id: encryptedGoogleCalendarChannelId,
    }
  );
  logger.info(`Successfully created calendar channel`);
};

module.exports = createCalendarChannel;
