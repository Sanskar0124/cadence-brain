// * Utils
const logger = require('../utils/winston');
const {
  unauthorizedResponseWithDevMsg,
  serverErrorResponseWithDevMsg,
  paymentRequiredResponseWithDevMsg,
  badRequestResponseWithDevMsg,
  accessDeniedResponseWithDevMsg,
} = require('../utils/response');
const { DB_TABLES } = require('../utils/modelEnums');

// * Packages
const { Op } = require('sequelize');

// * Repository
const Repository = require('../repository');

// * Helpers
const UserTokensHelper = require('../helper/userTokens');
const UserHelper = require('../helper/user');
const CryptoHelper = require('../helper/crypto');

module.exports.auth = async (req, res, next) => {
  try {
    if (req.headers.authorization === undefined)
      return unauthorizedResponseWithDevMsg({ res });

    const accessToken = req.headers.authorization.split(' ')[1];

    // * Encrypting tokens
    let [encryptedAccessToken, errEncryptingAccessToken] =
      CryptoHelper.encrypt(accessToken);
    if (errEncryptingAccessToken)
      return serverErrorResponseWithDevMsg({
        res,
        msg: 'Invalid access token',
        error: `Error while encrypting access token: ${errEncryptingAccessToken}`,
      });

    // * Fetch token in db
    const [ringoverToken, errFetchingRingoverToken] = await Repository.fetchOne(
      {
        tableName: DB_TABLES.RINGOVER_TOKENS,
        query: {
          encrypted_access_token: encryptedAccessToken,
          expires_at: {
            [Op.gte]: new Date(),
          },
        },
        include: {
          [DB_TABLES.USER]: {
            attributes: [
              'user_id',
              'first_name',
              'last_name',
              'email',
              'role',
              'sd_id',
              'is_profile_picture_present',
              'timezone',
            ],

            [DB_TABLES.COMPANY]: {
              attributes: [
                'company_id',
                'integration_type',
                'is_subscription_active',
                'is_trial_active',
                'trial_valid_until',
              ],
              [DB_TABLES.COMPANY_SETTINGS]: {
                attributes: ['mail_integration_type', 'email_scope_level'],
              },
            },
          },
        },
        extras: {
          attributes: ['ringover_token_id', 'region', 'user_id'],
        },
      }
    );
    if (errFetchingRingoverToken)
      return serverErrorResponseWithDevMsg({
        res,
        msg: 'Invalid access token',
        error: errFetchingRingoverToken,
      });
    if (!ringoverToken) {
      UserHelper.deleteUserSession(accessToken);
      return unauthorizedResponseWithDevMsg({
        res,
        msg: 'Session expired',
        error: 'Unable to find tokens',
      });
    }

    // * Assign user
    const user = ringoverToken?.User;

    if (!user)
      return accessDeniedResponseWithDevMsg({
        res,
        msg: `Your access has been revoked, Please contact your admin`,
      });

    if (
      user?.Company?.is_subscription_active ||
      (user?.Company?.is_trial_active &&
        new Date(user?.Company?.trial_valid_until) > new Date())
    ) {
      req.user = {
        access_token: accessToken,
        region: ringoverToken.region,
        user_id: user.user_id,
        email: user.email,
        company_id: user.Company.company_id,
        integration_type: user?.Company?.integration_type,
        mail_integration_type:
          user.Company.Company_Setting.mail_integration_type,
        email_scope_level: user.Company.Company_Setting.email_scope_level,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        sd_id: user.sd_id,
        is_profile_picture_present: user.is_profile_picture_present,
        timezone: user.timezone,
      };
      next();
      return;
    }

    if (!user?.Company?.is_subscription_active)
      return paymentRequiredResponseWithDevMsg({ res });
    else if (!user?.Company?.is_trial_active)
      return paymentRequiredResponseWithDevMsg({
        res,
        msg: 'Your trial period has ended',
      });
    else if (is_trial_active && trial_valid_until < new Date())
      return paymentRequiredResponseWithDevMsg({
        res,
        msg: 'Your trial period has expired',
      });
  } catch (err) {
    logger.error('Error while authenticating user: ', err);
    return serverErrorResponseWithDevMsg({
      res,
      error: `Error while authenticating user: ${err.message}`,
    });
  }
};
