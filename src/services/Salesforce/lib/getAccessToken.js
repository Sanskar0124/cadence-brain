// Utils
const logger = require('../../../utils/winston');
const axios = require('axios');
const {
  SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET,
} = require('../../../utils/config');
const checkIfAccessTokenIsValid = require('../utils/checkTokenValidity');

// Repositories
const UserTokenRepository = require('../../../repository/user-token.repository');

// Helpers and Services
const CryptoHelper = require('../../../helper/crypto');

const getNewAccessToken = async (refresh_token, user_id) => {
  try {
    let URL = `https://login.salesforce.com/services/oauth2/token?client_id=${SALESFORCE_CLIENT_ID}&client_secret=${SALESFORCE_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refresh_token}`;
    const { data } = await axios.get(URL);
    return [data, null];
  } catch (err) {
    if (
      err.response.data.error_description === 'expired access/refresh token'
    ) {
      await UserTokenRepository.updateUserTokenByQuery(
        { user_id },
        { is_salesforce_logged_out: 1 }
      );
      logger.info(
        'expired access/refresh token. updated is_salesforce_logged_out to true'
      );
      return [null, 'expired access/refresh token'];
    }
    logger.error(
      `Error while getting new access token using refresh token: ${JSON.stringify(
        err.response.data,
        null,
        2
      )}`
    );
    return [
      null,
      `Error while getting new access token using refresh token: ${err.message}`,
    ];
  }
};

const getAccessToken = async (user_id) => {
  try {
    const [tokens, errForTokens] =
      await UserTokenRepository.getUserTokenByQuery({ user_id });
    if (errForTokens)
      return [
        { access_token: null, refresh_token: null },
        'Error while fetching user tokens',
      ];

    // If user is not logged in with salesforce
    if (tokens.is_salesforce_logged_out || !tokens.salesforce_instance_url) {
      logger.info('Not logged in with salesforce');
      return [
        { access_token: null, refresh_token: null },
        'Please log in with salesforce',
      ];
    }

    const {
      salesforce_access_token,
      salesforce_refresh_token,
      salesforce_instance_url,
    } = tokens;

    // Checking is access token is valid
    const [valid, errForAccessToken] = await checkIfAccessTokenIsValid(
      salesforce_access_token
    );
    if (errForAccessToken)
      return [{ access_token: null, instance_url: null }, errForAccessToken];

    // If old access token is valid, return the same
    if (valid)
      return [
        {
          access_token: salesforce_access_token,
          instance_url: salesforce_instance_url,
        },
        null,
      ];

    logger.info('Generating new access token');
    // If access token is not valid, generate a new one using refresh token
    const [data, errForNewAccessToken] = await getNewAccessToken(
      salesforce_refresh_token,
      user_id
    );
    if (errForNewAccessToken)
      return [{ access_token: null, instance_url: null }, errForNewAccessToken];

    // Encrypting tokens
    let [accessToken, errForEncryptingToken] = CryptoHelper.encrypt(
      data.access_token
    );

    // Updating access token in user token model
    const [updatedUserToken, errForUserToken] =
      await UserTokenRepository.updateUserTokenByQuery(
        { user_id },
        {
          encrypted_salesforce_access_token: accessToken,
        }
      );
    if (errForUserToken)
      return [{ access_token: null, instance_url: null }, errForUserToken];

    return [
      {
        access_token: data.access_token,
        instance_url: data.instance_url,
      },
      null,
    ];
  } catch (err) {
    console.log(`Error in getAccessToken: ${err}`);
    return [{ access_token: null, instance_url: null }, err.message];
  }
};

module.exports = getAccessToken;
