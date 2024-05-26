const logger = require('../utils/winston');
const {
  unauthorizedResponseWithDevMsg,
  serverErrorResponseWithDevMsg,
} = require('../utils/response');
const { AUTOMATION_SECRET } = require('../utils/config');

module.exports.automationAuth = (req, res, next) => {
  try {
    if (req.headers.authorization === undefined) {
      return unauthorizedResponseWithDevMsg({ res });
    }
    const authToken = req.headers.authorization.split(' ')[1];
    if (AUTOMATION_SECRET !== authToken) {
      return unauthorizedResponseWithDevMsg({ res });
    }
    next();
    return;
  } catch (err) {
    logger.error('Error in automation auth: ', err);
    return serverErrorResponseWithDevMsg({
      res,
      error: `Error in automation auth: ${err.message}`,
    });
  }
};
