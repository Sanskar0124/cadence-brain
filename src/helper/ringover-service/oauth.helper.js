// * Package Imports
const axios = require('axios');
const FormData = require('form-data');

// * Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { COMPANY_REGION } = require('../../utils/enums');
const { RINGOVER_OAUTH } = require('../../utils/config');

// * Helper Imports
const CryptoHelper = require('../crypto');

// * Repository Import
const Repository = require('../../repository');

// * Fetch access token
const fetchAccessToken = async (user_id) => {
  try {
    let [ringoverTokens, errFetchingRingoverTokens] = await Repository.fetchOne(
      {
        tableName: DB_TABLES.RINGOVER_TOKENS,
        query: {
          user_id,
        },
      }
    );
    if (errFetchingRingoverTokens)
      return [{}, 'An error occurred. Please try again later'];
    if (!ringoverTokens) {
      logger.error('Ringover tokens not present for user');
      return [{}, 'Kindly login with Ringover'];
    }

    // * Generate access token
    const [{ id_token, refresh_token }, errFetchingAccessToken] =
      await getNewAccessToken(ringoverTokens.refresh_token);
    if (errFetchingAccessToken) {
      // * Logout user from Ringover
      await Repository.destroy({
        tableName: DB_TABLES.RINGOVER_TOKENS,
        query: {
          user_id,
        },
      });

      return [{}, 'Kindly login with Ringover'];
    }

    // * Update Tokens
    const [encryptedAccessToken, errAccessToken] =
      CryptoHelper.encrypt(id_token);
    if (errAccessToken) return [res, errAccessToken];
    const [encryptedRefreshToken, errRefreshToken] =
      CryptoHelper.encrypt(refresh_token);
    if (errRefreshToken) return [res, errRefreshToken];

    // * Update tokens
    await Repository.update({
      tableName: DB_TABLES.RINGOVER_TOKENS,
      query: { user_id },
      updateObject: {
        encrypted_access_token: encryptedAccessToken,
        encrypted_refresh_token: encryptedRefreshToken,
        user_id,
      },
    });

    return [
      {
        access_token: id_token,
        region: ringoverTokens.region,
      },
      null,
    ];
  } catch (err) {
    logger.error('Error while fetching access token from Ringover: ', err);
    return [null, err.message];
  }
};

const getNewAccessToken = async (refresh_token) => {
  try {
    var requestBody = new FormData();
    requestBody.append('refresh_token', refresh_token);
    requestBody.append('grant_type', 'refresh_token');
    requestBody.append('client_id', RINGOVER_OAUTH.RINGOVER_CLIENT_ID_EU);

    const { data } = await axios.post(
      'https://auth.ringover.com/oauth2/access_token',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...requestBody.getHeaders(),
        },
      }
    );

    return [data, null];
  } catch (err) {
    if (err?.response?.data) logger.error(JSON.stringify(err?.response?.data));
    logger.error(
      'An error occurred while fetching new Ringover Access token',
      err
    );
    return [{}, 'Unable to generate tokens'];
  }
};

module.exports = {
  fetchAccessToken,
};
