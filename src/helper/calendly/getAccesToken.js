// * Utils
const logger = require('../../utils/winston');
const {
  CALENDLY_REDIRECT_URI,
  CALENDLY_CLIENT_ID,
  CALENDLY_CLIENT_SECRET,
} = require('../../utils/config');
const { DB_TABLES } = require('../../utils/modelEnums');
//Repository
const Repository = require('../../repository');

// Helpers and Services
const CryptoHelper = require('../../helper/crypto');

// Packages
const axios = require('axios');

const GetAccessToken = async (user_id) => {
  try {
    const [userToken, errForUserToken] = await Repository.fetchOne({
      tableName: DB_TABLES.USER_TOKEN,
      query: {
        user_id: user_id,
      },
    });
    if (errForUserToken) return [null, errForUSer];

    let body = {
      client_id: CALENDLY_CLIENT_ID,
      client_secret: CALENDLY_CLIENT_SECRET,
      token: userToken.calendly_access_token,
    };
    const { data } = await axios.post(
      'https://auth.calendly.com/oauth/introspect',
      body
    );

    if (data.active) {
      return [userToken.calendly_access_token, null];
    }
    // Fetching access token
    let params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', userToken.calendly_refresh_token);
    params.append('redirect_uri', CALENDLY_REDIRECT_URI);
    const tokenResponse = await axios.post(
      'https://auth.calendly.com/oauth/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(
              `${CALENDLY_CLIENT_ID}:${CALENDLY_CLIENT_SECRET}`
            ).toString('base64'),
        },
      }
    );

    // Encrypting tokens
    const [accessToken, errAccessToken] = CryptoHelper.encrypt(
      tokenResponse.data.access_token
    );
    if (errAccessToken) return [null, errAccessToken];

    const [refreshToken, errRefreshToken] = CryptoHelper.encrypt(
      tokenResponse.data.refresh_token
    );
    if (errRefreshToken) return [null, errRefreshToken];

    // Storing tokens in DB
    const [updateUserToken, errForUpdatingUserToken] = await Repository.update({
      tableName: DB_TABLES.USER_TOKEN,
      query: { user_id: user_id },
      updateObject: {
        encrypted_calendly_access_token: accessToken,
        encrypted_calendly_refresh_token: refreshToken,
      },
    });
    if (errForUpdatingUserToken) {
      return [null, errForUpdatingUserToken];
    }
    return [tokenResponse.data.access_token, null];
  } catch (err) {
    logger.error(
      `An error occurred while fetching access token for calendly: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = GetAccessToken;
