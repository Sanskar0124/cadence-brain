// Utils
const logger = require('../../utils/winston');
const {
  PIPEDRIVE_CLIENT_ID,
  PIPEDRIVE_CLIENT_SECRET,
  FRONTEND_URL,
  PORT,
} = require('../../utils/config');
const { CRM_INTEGRATIONS } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const axios = require('axios');

// Repository
const Repository = require('../../repository');

// Helpers and Services
const CryptoHelper = require('../crypto');
const HtmlHelper = require('../html');
const AmazonService = require('../../services/Amazon');

const fetchAccessToken = async (user_id, tokens) => {
  try {
    if (tokens.is_logged_out || !tokens.instance_url)
      return [
        {
          access_token: null,
          instance_url: null,
          integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
        },
        'Kindly log in with pipedrive',
      ];

    // Checking is access token is valid
    const [valid, errForAccessToken] = await checkIfAccessTokenIsValid(
      tokens.instance_url,
      tokens.access_token
    );
    if (errForAccessToken)
      return [
        {
          access_token: null,
          instance_url: null,
          integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
        },
        errForAccessToken,
      ];

    // If old access token is valid, return the same
    if (valid)
      return [
        {
          access_token: tokens.access_token,
          instance_url: tokens.instance_url,
          integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
        },
        null,
      ];

    const [data, errForNewAccessToken, detailedError] = await getNewAccessToken(
      tokens.refresh_token
    );
    if (errForNewAccessToken) {
      Repository.update({
        tableName: DB_TABLES.PIPEDRIVE_TOKENS,
        query: { user_id },
        updateObject: {
          is_logged_out: 1,
          encrypted_access_token: null,
          encrypted_refresh_token: null,
          encrypted_instance_url: null,
        },
      });
      const [pdCompanyUser, errForFetchPdCompanyUser] =
        await Repository.fetchOne({
          tableName: DB_TABLES.COMPANY_SETTINGS,
          query: { user_id },
          include: { [DB_TABLES.USER]: { attributes: ['email'] } },
          extras: { attributes: [] },
        });
      if (pdCompanyUser) {
        AmazonService.sendHtmlMails({
          subject:
            'IMPORTANT! Issue with your Pipedrive connection with Ringover Cadence',
          body: HtmlHelper.reconnectCrmAdmin(
            `${FRONTEND_URL}/crm/pipedrive/profile`,
            CRM_INTEGRATIONS.PIPEDRIVE
          ),
          emailsToSend: [pdCompanyUser.User.email],
        });
        // * Alert mail
        AmazonService.sendHtmlMails({
          subject: '[ERROR] : USER DISCONNECTED FROM CADENCE',
          body: `
              <html> 
                <body> 
                  <p>User disconnected from cadence.</p>
                  <p> Integration :  Pipedrive </p>
                  <p>User: ${pdCompanyUser?.User?.email}</p>
                  <p>Error Message: ${errForNewAccessToken}</p>
                  <p>Detailed Error: ${detailedError} </p>
                  <p>Service: ${PORT} </p>
                </body>
              </html>
            `,
          emailsToSend: ['yuvi@bjtmail.com'],
        });
      }

      return [
        {
          access_token: null,
          instance_url: null,
          integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
        },
        errForNewAccessToken,
      ];
    }

    // Encrypting tokens
    const [accessToken, _] = CryptoHelper.encrypt(data.access_token);
    const [refreshToken, __] = CryptoHelper.encrypt(data.refresh_token);

    await Repository.update({
      tableName: DB_TABLES.PIPEDRIVE_TOKENS,
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
        instance_url: tokens.instance_url,
        integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
      },
    ];
  } catch (err) {
    logger.error('Error while fetching pipedrive access token: ', err);
    return [
      {
        access_token: null,
        instance_url: null,
        integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
      },
      err.message,
    ];
  }
};

const checkIfAccessTokenIsValid = async (instance_url, access_token) => {
  try {
    if (!instance_url) return [false, null];
    let URL = `${instance_url}/v1/users/me`;
    const res = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (res.status === 200) return [true, null];
    else return [false, null];
  } catch (err) {
    if (err?.response?.status === 401) return [false, null];
    logger.error(
      `Error while checking if access token is valid: ${
        err?.response?.data ?? err.message
      }`
    );
    return [null, err.message];
  }
};

const getNewAccessToken = async (refresh_token) => {
  try {
    let body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', refresh_token);

    let URL = `https://oauth.pipedrive.com/oauth/token`;
    const { data } = await axios.post(URL, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(
            `${PIPEDRIVE_CLIENT_ID}:${PIPEDRIVE_CLIENT_SECRET}`
          ).toString('base64'),
      },
    });
    return [data, null, null]; //TODO: ADDED FOR EMAIL LOGGING
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

const PipedriveTokenHelper = {
  fetchAccessToken,
  checkIfAccessTokenIsValid,
  getNewAccessToken,
};

module.exports = PipedriveTokenHelper;
