// Utils
const logger = require('../../utils/winston');
const {
  SELLSY_CLIENT_ID,
  SELLSY_CLIENT_SECRET,
} = require('../../utils/config');
const { CRM_INTEGRATIONS } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const axios = require('axios');

// Repository
const Repository = require('../../repository');

// Helpers
const CryptoHelper = require('../crypto');

const fetchAccessToken = async (user_id, tokens, integration_id) => {
  try {
    if (tokens.is_logged_out)
      return [
        {
          access_token: null,
          integration_type: CRM_INTEGRATIONS.SELLSY,
        },
        'Kindly log in with sellsy.',
      ];

    // Checking is access token is valid
    const [valid, errForAccessToken] = await checkIfAccessTokenIsValid(
      tokens.access_token,
      integration_id
    );

    // If old access token is valid, return the same
    if (valid)
      return [
        {
          access_token: tokens.access_token,
          integration_type: CRM_INTEGRATIONS.SELLSY,
        },
        null,
      ];

    const [data, errForNewAccessToken] = await getNewAccessToken(
      user_id,
      tokens.refresh_token
    );
    if (errForNewAccessToken) {
      Repository.update({
        tableName: DB_TABLES.SELLSY_TOKENS,
        query: { user_id },
        updateObject: {
          is_logged_out: 1,
          encrypted_access_token: null,
          encrypted_refresh_token: null,
        },
      });
      return [
        {
          access_token: null,
          integration_type: CRM_INTEGRATIONS.SELLSY,
        },
        errForNewAccessToken,
      ];
    }

    return [
      {
        access_token: data.access_token,
        integration_type: data.integration_type,
      },
      null,
    ];
  } catch (err) {
    logger.error('Error while fetching sellsy access token: ', err);
    return [
      {
        access_token: null,
        integration_type: CRM_INTEGRATIONS.SELLSY,
      },
      err.message,
    ];
  }
};

const checkIfAccessTokenIsValid = async (access_token, integration_id) => {
  try {
    const res = await axios.get(
      `https://api.sellsy.com/v2/staffs/${integration_id}?field[]=id&field[]=status`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (res.data?.status === 'ok') return [true, null];
    else return [false, null];
  } catch (err) {
    if (err?.response?.data?.error?.status === 401) return [false, null];
    logger.error(
      `Error while checking if access token is valid: ${err?.response?.data?.error?.message}`
    );
    return [null, err?.response?.data?.error?.message];
  }
};

const getNewAccessToken = async (user_id, refresh_token) => {
  try {
    let body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', refresh_token);
    body.append('client_id', SELLSY_CLIENT_ID);
    body.append('client_secret', SELLSY_CLIENT_SECRET);

    const { data } = await axios.post(
      `https://login.sellsy.com/oauth2/access-tokens`,
      body
    );

    // Encrypting tokens
    const [accessToken, _] = CryptoHelper.encrypt(data.access_token);
    const [refreshToken, __] = CryptoHelper.encrypt(data.refresh_token);

    await Repository.update({
      tableName: DB_TABLES.SELLSY_TOKENS,
      query: { user_id },
      updateObject: {
        is_logged_out: 0,
        encrypted_access_token: accessToken,
        encrypted_refresh_token: refreshToken,
        expires_in: data.expires_in,
      },
    });
    return [
      {
        access_token: data.access_token,
        integration_type: CRM_INTEGRATIONS.SELLSY,
      },
      null,
    ];
  } catch (err) {
    logger.error(
      `Error while getting new access token using refresh token: ${JSON.stringify(
        err.response.data,
        null,
        2
      )}`
    );
    return [null, `Error while getting new access token using refresh token`];
  }
};

const SellsyTokenHelper = {
  fetchAccessToken,
  checkIfAccessTokenIsValid,
  getNewAccessToken,
};

module.exports = SellsyTokenHelper;
