const logger = require('../../utils/winston');
const RedisHelper = require('../redis');

const isValidAccessToken = async (accessToken, user_id) => {
  try {
    let [validTokens, errForValidTokens] = await RedisHelper.getValue(
      'accessToken_' + user_id
    );
    if (errForValidTokens) return serverErrorResponse(res, errForValidTokens);
    validTokens = JSON.parse(validTokens);
    const regexp = new RegExp(
      `${accessToken.replace('.', '\\.')}\\$expiry=(.)*`,
      'i'
    );
    const validToken = await validTokens?.find((token) => {
      return regexp.test(token);
    });
    if (!validToken) return [false, null];
    const expiry = validToken.split('$expiry=')[1];
    if (expiry != 'none') {
      if (expiry < new Date().getTime()) return [false, null];
    }
    return [true, null];
  } catch (err) {
    logger.error('Error while checking valid access token:', err);
    return [null, err];
  }
};

module.exports = isValidAccessToken;
