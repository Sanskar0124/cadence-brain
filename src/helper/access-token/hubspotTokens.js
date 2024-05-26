// Utils
const logger = require('../../utils/winston');
const {
  HUBSPOT_CLIENT_ID,
  HUBSPOT_CLIENT_SECRET,
  HUBSPOT_REDIRECT_URI,
} = require('../../utils/config');
const { CRM_INTEGRATIONS } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const axios = require('axios');

// Repository
const Repository = require('../../repository');

// Helpers and services
const CryptoHelper = require('../crypto');
const AmazonService = require('../../services/Amazon');

const fetchAccessToken = async (user_id, tokens, integration_id) => {
  try {
    if (tokens.is_logged_out) {
      return [
        {
          access_token: null,
          integration_type: CRM_INTEGRATIONS.HUBSPOT,
        },
        'Kindly log in to hubspot',
      ];
    }

    // Checking is access token is valid
    const [valid, errForAccessToken] = await checkIfAccessTokenIsValid(
      tokens.access_token,
      integration_id
    );
    if (errForAccessToken)
      return [
        {
          access_token: null,
          integration_type: CRM_INTEGRATIONS.HUBSPOT,
        },
        errForAccessToken,
      ];

    // If old access token is valid, return the same
    if (valid)
      return [
        {
          access_token: tokens.access_token,
          integration_type: CRM_INTEGRATIONS.HUBSPOT,
        },
        null,
      ];

    const [data, errForNewAccessToken, detailedError] = await getNewAccessToken(
      user_id,
      tokens.refresh_token
    );
    if (errForNewAccessToken) {
      Repository.update({
        tableName: DB_TABLES.HUBSPOT_TOKENS,
        query: { user_id },
        updateObject: {
          is_logged_out: 1,
          encrypted_access_token: null,
          //encrypted_instance_url: null,
        },
      });

      const [hsCompanyUser, errForFetchSfCompanyUser] =
        await Repository.fetchOne({
          tableName: DB_TABLES.COMPANY_SETTINGS,
          query: { user_id },
          include: { [DB_TABLES.USER]: { attributes: ['email'] } },
          extras: { attributes: [] },
        });
      if (hsCompanyUser) {
        // * Alert mail
        AmazonService.sendHtmlMails({
          subject: '[ERROR] : USER DISCONNECTED FROM CADENCE',
          body: `
            <html> 
              <body> 
                <p>User disconnected from cadence.</p>
                <p> Integration :  Hubspot </p>
                <p>User: ${hsCompanyUser?.User?.email}</p>
                <p>Error Message: ${errForNewAccessToken}</p>
                <p>Detailed Error: ${detailedError} </p>
              </body>
            </html>
          `,
          emailsToSend: ['yuvi@bjtmail.com'],
        });
      }

      return [
        {
          access_token: null,
          //instance_url: null,
          integration_type: CRM_INTEGRATIONS.HUBSPOT,
        },
        'Kindly login with Hubspot',
      ];
    }

    // Encrypting tokens
    const [accessToken, _] = CryptoHelper.encrypt(data.access_token);
    const [refreshToken, __] = CryptoHelper.encrypt(data.refresh_token);

    await Repository.update({
      tableName: DB_TABLES.HUBSPOT_TOKENS,
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
        //instance_url: tokens.instance_url,
        integration_type: CRM_INTEGRATIONS.HUBSPOT,
      },
    ];
  } catch (err) {
    logger.error('Error while fetching hubspot access token: ', err);
    return [
      {
        access_token: null,
        //instance_url: null,
        integration_type: CRM_INTEGRATIONS.HUBSPOT,
      },
      err.message,
    ];
  }
};

const checkIfAccessTokenIsValid = async (access_token) => {
  try {
    let URL = `https://api.hubapi.com/crm/v3/owners`;
    const res = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (res.status === 200) return [true, null];
    else return [false, null];
  } catch (err) {
    logger.error(`Error while checking if access token is valid: `, err);
    return [false, null];
  }
};

const getNewAccessToken = async (user_id, refresh_token) => {
  try {
    let body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', refresh_token);
    body.append('client_id', HUBSPOT_CLIENT_ID);
    body.append('client_secret', HUBSPOT_CLIENT_SECRET);
    body.append('redirect_uri', HUBSPOT_REDIRECT_URI);

    let URL = `https://api.hubapi.com/oauth/v1/token`;
    const { data } = await axios.post(URL, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Encrypting tokens
    const [accessToken, _] = CryptoHelper.encrypt(data.access_token);
    const [refreshToken, __] = CryptoHelper.encrypt(data.refresh_token);

    await Repository.update({
      tableName: DB_TABLES.HUBSPOT_TOKENS,
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
        integration_type: CRM_INTEGRATIONS.HUBSPOT,
      },
      null,
      null, //TODO: ADDED FOR EMAIL LOGGING
    ];
  } catch (err) {
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
      JSON.stringify(err.response.data, null, 2), //TODO: ADDED FOR EMAIL LOGGING
    ];
  }
};

const HubspotTokenHelper = {
  fetchAccessToken,
  checkIfAccessTokenIsValid,
  getNewAccessToken,
};

module.exports = HubspotTokenHelper;
