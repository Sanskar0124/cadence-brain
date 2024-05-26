const logger = require('../utils/winston');
const {
  unauthorizedResponseWithDevMsg,
  serverErrorResponseWithDevMsg,
} = require('../utils/response');
const { DEV_AUTH } = require('../utils/config');

module.exports.devAuth = (req, res, next) => {
  try {
    if (req.headers.authorization == undefined)
      return unauthorizedResponseWithDevMsg({ res });

    const authToken = req.headers.authorization.split(' ')[1];
    if (DEV_AUTH !== authToken) return unauthorizedResponseWithDevMsg({ res });
    req.company_id = '4192bff0-e1e0-43ce-a4db-912808c32493';

    next();
    return;
  } catch (err) {
    logger.error('Error while passing dev auth: ', err);
    return serverErrorResponseWithDevMsg({
      res,
      error: `Error while passing dev auth: ${err.message}`,
    });
  }
};
