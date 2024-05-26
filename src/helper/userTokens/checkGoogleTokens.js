// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { TRACKING_ACTIVITIES, TRACKING_REASONS } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Repositories
const UserTokenRepository = require('../../repository/user-token.repository');
const Repository = require('../../repository');

// Subtract hours
Date.prototype.subtractDays = function (d) {
  this.setHours(this.getUTCHours() - d * 24);
  return this;
};

/*
 * This function ensures that if a google_refresh_token has expired, then the user is signed out
 * Query the database for users with google_token_expiration for older than 7 days
 * These users are to be signed out
 */
const checkGoogleTokens = async () => {
  try {
    logger.info('Checking if google tokens are valid...');

    // * Generating timestamp 7 days old
    let sevenDaysOldTimestamp = new Date();
    sevenDaysOldTimestamp.subtractDays(7);
    sevenDaysOldTimestamp = sevenDaysOldTimestamp.getTime();

    // * Fetch all userTokens with expiration older than 7 days
    //TODO: Refactor
    let [expiredUserTokens, errFetchingExpiredUserTokens] =
      await UserTokenRepository.getUserTokensByQuery({
        google_token_expiration: {
          [Op.lte]: sevenDaysOldTimestamp,
        },
        is_google_token_expired: false,
      });

    if (errFetchingExpiredUserTokens)
      logger.error(
        'Could not fetch user tokens to check for google expiry: ',
        errFetchingExpiredUserTokens
      );

    logger.info('Found ' + expiredUserTokens.length + ' tokens expired');

    for (let expiredUserToken of expiredUserTokens) {
      //TODO: Refactor
      const [data, err] = await UserTokenRepository.updateUserTokenByQuery(
        {
          user_token_id: expiredUserToken.user_token_id,
        },
        {
          encrypted_google_refresh_token: null,
          is_google_token_expired: 1,
          google_token_expiration: null,
        }
      );
      if (!err)
        Repository.create({
          tableName: DB_TABLES.TRACKING,
          createObject: {
            user_id: expiredUserToken.user_id,
            activity: TRACKING_ACTIVITIES.GOOGLE_SIGNED_OUT,
            reason: TRACKING_REASONS.TOKEN_EXPIRED_MORE_THAN_7_DAYS_AGO,
            metadata: {
              controller: `Cron: checkGoogleTokens`,
            },
          },
        });
    }
    logger.info('Successfully checked user tokens for google expiry');
  } catch (err) {
    logger.error(
      `An error ocurred while signing out users with expired tokens: `,
      err
    );
  }
};

module.exports = checkGoogleTokens;
