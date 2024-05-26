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

/**
 * Check if tokens expired for user
 * @param {import('sequelize').DataTypeUUIDv4} user_id  user_id to check token for
 * @returns {Promise<[Boolean,Error]>}
 */
const isOutlookTokenExpired = async (user_id) => {
  try {
    const [userToken, errForToken] = await Repository.fetchOne({
      tableName: DB_TABLES.USER_TOKEN,
      query: {
        user_id,
      },
      extras: {
        attributes: ['is_outlook_token_expired'],
      },
    });

    return [userToken.is_outlook_token_expired === 1, null];
  } catch (err) {
    logger.error(`Error while checking if outlook token is expired: `, err);
    return [null, err.message];
  }
};
/**
 * Store outlook tokens as expired
 * @param {import('sequelize').DataTypeUUIDv4} user_id user_id
 * @param {JSON} metadata additional data for tracking
 * @returns {Promise<[Boolean,Error]>}
 */
const storeOutlookTokenAsExpired = async (user_id, metadata = {}) => {
  try {
    console.log('===storeOutlookTokenAsExpired===');

    const [userToken, errForUserToken] = await Repository.fetchOne({
      tableName: DB_TABLES.USER_TOKEN,
      query: { user_id },
    });
    if (errForUserToken) return [null, errForUserToken];

    var [updatedObj, errForUpdate] =
      await UserTokenRepository.updateUserTokenByQuery(
        { user_id },
        { is_outlook_token_expired: true }
      );
    if (errForUpdate) return [null, errForUpdate];
    // if previously fetched userToken have is_outlook_token_expired as 0 and no error has occured, make an entry in tracking table as user's outlook token expired
    if (!userToken?.is_outlook_token_expired && !errForUpdate) {
      // if metadata is an array or is not an object, then change it to {} as metadata has type JSON in db
      if (Array.isArray(metadata) || typeof metadata !== 'object')
        metadata = {};
      Repository.create({
        tableName: DB_TABLES.TRACKING,
        createObject: {
          user_id,
          activity: TRACKING_ACTIVITIES.OUTLOOK_SIGNED_OUT,
          reason: TRACKING_REASONS.TOKEN_EXPIRED_OR_REVOKED,
          metadata,
        },
      });
    }
    return [true, null];
  } catch (err) {
    logger.error(`Error while saving outlook token as expired : `, err);
    return [null, err.message];
  }
};

module.exports = {
  isOutlookTokenExpired,
  storeOutlookTokenAsExpired,
};
