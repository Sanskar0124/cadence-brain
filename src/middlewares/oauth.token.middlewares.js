// Utils
const {
  unauthorizedResponseWithDevMsg,
  badRequestResponseWithDevMsg,
  serverErrorResponseWithDevMsg,
} = require('../utils/response');
const logger = require('../utils/winston');
const { DB_TABLES } = require('../utils/modelEnums');
const { MAIL_INTEGRATION_TYPES } = require('../utils/enums');

// Helper
const ErrMsgHelper = require('../helper/err-message');

// Repositories
const Repository = require('../repository');

module.exports = async (req, res, next) => {
  try {
    const { user_id, mail_integration_type } = req.user;

    switch (mail_integration_type) {
      case MAIL_INTEGRATION_TYPES.GOOGLE: {
        const [userToken, err] = await Repository.fetchOne({
          tableName: DB_TABLES.USER_TOKEN,
          query: { user_id },
        });
        if (err)
          return unauthorizedResponseWithDevMsg({
            res,
            msg: "Token doesn't belong to any user",
          });

        if (
          !userToken?.google_refresh_token ||
          userToken.is_google_token_expired
        ) {
          const [errMessage, errForErrMessage] =
            await ErrMsgHelper.createGoogleErrMsg(req.originalUrl, req.method);
          if (errForErrMessage)
            return badRequestResponseWithDevMsg({
              res,
            });
          return badRequestResponseWithDevMsg({
            res,
            msg: errMessage,
          });
        }

        req.token = {
          refresh_token: userToken?.google_refresh_token,
          type: MAIL_INTEGRATION_TYPES.GOOGLE,
        };
        return next();
      }
      case MAIL_INTEGRATION_TYPES.OUTLOOK: {
        const [userToken, err] = await Repository.fetchOne({
          tableName: DB_TABLES.USER_TOKEN,
          query: { user_id },
        });
        if (err)
          return unauthorizedResponseWithDevMsg({
            res,
            msg: "Token doesn't belong to any user",
          });

        if (
          !userToken?.outlook_refresh_token ||
          userToken.is_outlook_token_expired
        ) {
          return unauthorizedResponseWithDevMsg({
            res,
            msg: 'Sign In with Outlook to access this feature',
          });
        }

        req.token = {
          refresh_token: userToken?.outlook_refresh_token,
          type: MAIL_INTEGRATION_TYPES.OUTLOOK,
        };
        return next();
      }
      default: {
        logger.info(`Invalid mail integration type`);
        return unauthorizedResponseWithDevMsg({
          res,
          msg: 'Invalid mail integration type: Please ask Super Admin to register an type of integration for accessing your mails and calendars',
        });
      }
    }
  } catch (err) {
    logger.error('Error while checking oauth:', err);
    return serverErrorResponseWithDevMsg({
      res,
      error: `Error while checking oauth: ${err.message}`,
    });
  }
};
