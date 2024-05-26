// Utils
const logger = require('../../utils/winston.js');

// Repositories
const UserTokenRepository = require('../../repository/user-token.repository.js');
const Repository = require('../../repository');
const { DB_TABLES } = require('../../utils/modelEnums.js');
const {
  TRACKING_REASONS,
  TRACKING_ACTIVITIES,
} = require('../../utils/enums.js');

// isGoogleTokenExpired
const isGoogleTokenExpired = async (user_id) => {
  try {
    var [obj, err] = UserTokenRepository.getUserTokenByQuery({ user_id });
    if (err) return [null, err];

    return [obj.is_google_token_expired == 1, null];
  } catch (err) {
    logger.error(`Error while getting data from user token data : `, err);
    return [null, err.message];
  }
};

// googleAccessRefreshed
const googleAccessRefreshed = async (user_id) => {
  try {
    var [updatedObj, err] = await UserTokenRepository.updateUserTokenByQuery(
      { user_id },
      { is_google_token_expired: false }
    );
    if (err) return [null, err];

    return [updatedObj, null];
  } catch (err) {
    logger.error(`Error while saving user token : `, err);
    return [null, err.message];
  }
};

const storeGoogleTokenAsExpired = async (user_id, metadata = {}) => {
  try {
    console.log('===storeGoogleTokenAsExpired===');

    const [userToken, errForUserToken] = await Repository.fetchOne({
      tableName: DB_TABLES.USER_TOKEN,
      query: { user_id },
    });

    var [updatedObj, err] = await UserTokenRepository.updateUserTokenByQuery(
      { user_id },
      { is_google_token_expired: true }
    );
    // if previously fetched userToken have is_google_token_expired as 0 and no error has occured, make an entry in tracking table as user's google token expired
    if (!userToken?.is_google_token_expired && !err) {
      // if metadata is an array or is not an object, then change it to {} as metadata has type JSON in db
      if (Array.isArray(metadata) || typeof metadata !== 'object')
        metadata = {};
      Repository.create({
        tableName: DB_TABLES.TRACKING,
        createObject: {
          user_id,
          activity: TRACKING_ACTIVITIES.GOOGLE_SIGNED_OUT,
          reason: TRACKING_REASONS.TOKEN_EXPIRED_OR_REVOKED,
          metadata,
        },
      });
    }
  } catch (err) {
    logger.error(`Error while saving user token : `, err);
    return [null, err.message];
  }
};

module.exports = {
  isGoogleTokenExpired,
  googleAccessRefreshed,
  storeGoogleTokenAsExpired,
};
