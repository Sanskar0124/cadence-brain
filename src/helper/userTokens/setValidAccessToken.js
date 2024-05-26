const logger = require('../../utils/winston');
const RedisHelper = require('../redis');

const setValidAccessToken = async (accessToken, user_id, expiry = 'none') => {
  try {
    accessToken = accessToken + `$expiry=${expiry}`;
    const [_, errForValidToken] = await RedisHelper.appendValueToArray(
      'accessToken_' + user_id,
      accessToken
    );
    if (errForValidToken) return [null, errForValidToken];
    return [true, null];
  } catch (err) {
    logger.error('Error while setting valid access token:', err);
    return [null, err];
  }
};

module.exports = setValidAccessToken;
