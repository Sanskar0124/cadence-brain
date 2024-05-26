// Utils
const config = require('../../utils/config');
const logger = require('../../utils/winston');
const { OUTLOOK_ACCESS_TOKEN_REDIS_KEY } = require('../../utils/constants');

// Packages
const axios = require('axios');

// Helpers
const redisHelper = require('../../helper/redis');
const TokenHelper = require('../../helper/outlook/tokens');

// Others
const { OUTLOOK_OAUTH } = config;
const OAUTH_SCOPES = ` offline_access User.Read Mail.ReadWrite Calendars.ReadWrite Mail.Send openid profile email`;

const generateAuthUrl = async (user_id) => {
  try {
    let authUrl = new URL(
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
    );

    authUrl.searchParams.set('client_id', OUTLOOK_OAUTH.CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', OUTLOOK_OAUTH.REDIRECT_URL);
    authUrl.searchParams.set('state', user_id);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('response_mode', 'query');
    authUrl.searchParams.set('scope', OAUTH_SCOPES);

    return [authUrl, null];
  } catch (error) {
    logger.error(`Error while generating auth Url: `, error);
    return [null, error.message];
  }
};

const getRefreshToken = async (authCode) => {
  try {
    const params = new URLSearchParams();
    params.append('client_id', OUTLOOK_OAUTH.CLIENT_ID);
    params.append('client_secret', OUTLOOK_OAUTH.CLIENT_SECRET);
    params.append('redirect_uri', OUTLOOK_OAUTH.REDIRECT_URL);
    params.append('grant_type', 'authorization_code');
    params.append('scope', OAUTH_SCOPES);
    params.append('code', authCode);

    const res = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const tokenData = res.data;

    return [tokenData, null];
  } catch (error) {
    logger.error(
      `Error while fetching outlook tokens: ${
        error?.response?.data?.error_description ?? error.message
      }`,
      error
    );
    return [null, error?.response?.data?.error_description ?? error.message];
  }
};

//takes up refresh token, searches in redis if found returns it, otherwise fetches from server and sets in Redis
const getActiveAccessToken = async (refresh_token) => {
  try {
    // Checking cache
    let [redisValue, redisErr] = await redisHelper.getValue(
      OUTLOOK_ACCESS_TOKEN_REDIS_KEY + '-' + refresh_token
    );
    if (redisValue) {
      logger.info(`Found outlook access token in cache`);
      return [redisValue, null];
    }

    // Fetching from server
    logger.info(
      `Access token not found in cache, fetching it from microsoft service`
    );

    const params = new URLSearchParams();
    params.append('client_id', OUTLOOK_OAUTH.CLIENT_ID);
    params.append('client_secret', OUTLOOK_OAUTH.CLIENT_SECRET);
    params.append('grant_type', 'refresh_token');
    params.append('scope', OAUTH_SCOPES);
    params.append('refresh_token', refresh_token);

    const res = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token, expires_in } = res.data;

    // Setting cache
    const [_, redisError] = await redisHelper.setWithExpiry(
      OUTLOOK_ACCESS_TOKEN_REDIS_KEY + '-' + refresh_token,
      access_token,
      expires_in - 10 //keeping a margin of 10sec to expire in our system before 10sec
    );
    if (redisError) logger.error(`Failed to update in redis`);

    return [access_token, null];
  } catch (err) {
    logger.error(
      `Error while fetching outlook access token from refresh token: ${
        err?.response?.data?.error?.message ?? err.message
      }`,
      err
    );

    if (err?.response?.data?.error === 'invalid_grant')
      return [null, 'invalid_grant'];

    return [null, err.response?.data?.error_description ?? err.message];
  }
};

const getUser = async (refresh_token) => {
  try {
    const [access_token, err] = await getActiveAccessToken(refresh_token);
    if (err) return [null, err];

    const res = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const user = res.data;
    return [user, null];
  } catch (error) {
    logger.error(`Error while fetching outlook user: `, error);
    return [null, error.message];
  }
};

// to be removed
const revokeToken = async (refresh_token) => {
  try {
    const [access_token, err] = await getActiveAccessToken(refresh_token);
    if (err) return [null, err];

    const res = await axios.get(
      'https://graph.microsoft.com/v1.0/me/revokeSignInSessions',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return [res.data, null];
  } catch (error) {
    logger.error(`Error while revoking outlook token`, error);
    return [null, error.message];
  }
};

const oauth2Client = {
  generateAuthUrl,
  getRefreshToken,
  getActiveAccessToken,
  getUser,
  revokeToken,
};

module.exports = oauth2Client;
