// Utils
const logger = require('../../utils/winston');
const { GOOGLE_OAUTH_ADVANCE } = require('../../utils/config');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const UserTokenRepository = require('../../repository/user-token.repository');
const Repository = require('../../repository');

// Services
const Inbox = require('../../services/Google/Mail/lib/Inbox');

// Helpers and Services
const CryptoHelper = require('../crypto');
// const createCalendarChannel = require('../calendar/createNotificationChannel');

Date.prototype.addHours = function (h) {
  this.setHours(this.getUTCHours() + h);
  return this;
};

const CronRenewGoogleNotificationChannel = async () => {
  try {
    logger.info('Running webhook renew for google mail and calendar...');

    // * Timestamp in one hour
    let timeAfterOneHour = new Date();
    timeAfterOneHour.addHours(1);

    // * Fetch all users whose tokens are expiring in the next 1 hr
    let [userTokens, errFetchingUserTokens] = await Repository.fetchAll({
      tableName: DB_TABLES.USER_TOKEN,
      query: {
        is_google_token_expired: 0,
        google_token_expiration: {
          [Op.lte]: timeAfterOneHour.getTime(),
        },
      },
      extras: {
        attributes: [
          'user_token_id',
          'user_id',
          'encrypted_google_refresh_token',
          'google_refresh_token',
          'is_google_token_expired',
        ],
      },
    });
    if (errFetchingUserTokens) throw new Error(errFetchingUserTokens);

    // * Renew notification channel for those users
    for (let userToken of userTokens) {
      if (!userToken.google_refresh_token) {
        Repository.update({
          tableName: DB_TABLES.USER_TOKEN,
          query: { user_id: userToken.user_id },
          updateObject: {
            is_google_token_expired: true,
          },
        });
        continue;
      }
      logger.info('Refreshing channel for: ' + userToken.user_id);
      console.log(`
        Google refresh token : 
        ${JSON.stringify({
          google_refresh_token: userToken?.google_refresh_token,
          client_id: GOOGLE_OAUTH_ADVANCE.CLIENT_ID,
          client_secret: GOOGLE_OAUTH_ADVANCE.CLIENT_SECRET,
          redirect_url: GOOGLE_OAUTH_ADVANCE.REDIRECT_URL,
        })}`);
      let results = await Promise.all([
        Inbox.createNotificationChannel({
          refresh_token: userToken?.google_refresh_token,
        }),
      ]);

      let [history] = results[0];

      if (!history) continue;

      // * Encrypt google history Id
      const [
        encryptedGoogleMailLastHistoryId,
        errForEncryptedGoogleMailLastHistoryId,
      ] = CryptoHelper.encrypt(history.historyId);

      if (!errForEncryptedGoogleMailLastHistoryId) {
        // * Update with new history id and expiration
        const [_, errForUserTokenUpdate] = await Repository.update({
          tableName: DB_TABLES.USER_TOKEN,
          query: { user_id: userToken.user_id },
          updateObject: {
            encrypted_google_mail_last_history_id:
              encryptedGoogleMailLastHistoryId,
            google_token_expiration: history.expiration,
          },
        });
        if (errForUserTokenUpdate) continue;
      }
    }
    logger.info(
      'Successfully executed google mail and calendar refresh notification channel'
    );
  } catch (err) {
    logger.error(
      `An error occurred while trying to renew google mail and calendar notification channel: `,
      err
    );
  }
};

module.exports = CronRenewGoogleNotificationChannel;
