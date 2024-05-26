// Utils
const logger = require('../../utils/winston');
const {
  BULLHORN_CLIENT_ID,
  BULLHORN_CLIENT_SECRET,
  BULLHORN_REDIRECT_URI,
  FRONTEND_URL,
  PORT,
} = require('../../utils/config');
const { HIRING_INTEGRATIONS } = require('../../utils/enums');
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
    if (tokens.is_logged_out) {
      return [
        {
          instance_url: null,
          access_token: null,
          integration_type: HIRING_INTEGRATIONS.BULLHORN,
        },
        'Kindly log in to bullhorn.',
      ];
    }
    // Checking is access token is valid
    const [valid, errForAccessToken] = await checkIfAccessTokenIsValid(
      tokens.access_token,
      tokens.instance_url
    );
    if (errForAccessToken)
      return [
        {
          access_token: null,
          instance_url: null,
          server_url: null,
          integration_type: HIRING_INTEGRATIONS.BULLHORN,
        },
        errForAccessToken,
      ];

    // If old access token is valid, return the same
    if (valid)
      return [
        {
          access_token: tokens.access_token,
          instance_url: tokens.instance_url,
          server_url: tokens.server_url,
          integration_type: HIRING_INTEGRATIONS.BULLHORN,
        },
        null,
      ];
    const [data, errForNewAccessToken, detailedError] = await getNewAccessToken(
      tokens.refresh_token
    );
    if (errForNewAccessToken) {
      Repository.update({
        tableName: DB_TABLES.BULLHORN_TOKENS,
        query: { user_id },
        updateObject: {
          is_logged_out: 1,
          encrypted_refresh_token: null,
          encrypted_instance_url: null,
        },
      });
      const [bullhornCRMUser, errForFetchZCompanyUser] =
        await Repository.fetchOne({
          tableName: DB_TABLES.COMPANY_SETTINGS,
          query: { user_id },
          include: { [DB_TABLES.USER]: { attributes: ['email'] } },
          extras: { attributes: [] },
        });
      if (bullhornCRMUser) {
        AmazonService.sendHtmlMails({
          subject:
            'IMPORTANT! Issue with your Bullhorn connection with Cadence',
          body: HtmlHelper.reconnectCrmAdmin(
            `${FRONTEND_URL}/crm/bullhorn/profile`,
            HIRING_INTEGRATIONS.BULLHORN
          ),
          emailsToSend: [bullhornCRMUser.User.email],
        });
        // * Alert mail
        AmazonService.sendHtmlMails({
          subject: '[ERROR] : USER DISCONNECTED FROM CADENCE',
          body: `
            <html> 
              <body> 
                <p>User disconnected from cadence.</p>
                <p> Integration :  Bullhorn </p>
                <p>User: ${bullhornCRMUser?.User?.email}</p>
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
          instance_url: null,
          access_token: null,
          integration_type: HIRING_INTEGRATIONS.BULLHORN,
        },
        errForNewAccessToken,
      ];
    }

    // Encrypting tokens
    const [accessToken, _] = CryptoHelper.encrypt(data.BhRestToken);
    const [refreshToken, ___] = CryptoHelper.encrypt(data.refresh_token);
    const [instance_url, __] = CryptoHelper.encrypt(data.restUrl);

    await Repository.update({
      tableName: DB_TABLES.BULLHORN_TOKENS,
      query: { user_id },
      updateObject: {
        is_logged_out: 0,
        encrypted_refresh_token: refreshToken,
        encrypted_access_token: accessToken,
        encrypted_instance_url: instance_url,
        expires_in: data.expires_in,
      },
    });

    return [
      {
        instance_url: data.restUrl,
        access_token: data.BhRestToken,
        integration_type: HIRING_INTEGRATIONS.BULLHORN,
      },
    ];
  } catch (err) {
    logger.error('Error while fetching bullhorn access token: ', err);
    return [
      {
        access_token: null,
        instance_url: null,
        integration_type: HIRING_INTEGRATIONS.BULLHORN,
      },
      err.message,
    ];
  }
};
const checkIfAccessTokenIsValid = async (access_token, instance_url) => {
  try {
    const res = await axios.get(`${instance_url}/ping`, {
      headers: {
        BhRestToken: `${access_token}`,
      },
    });
    if (res.status === 200) return [true, null];
    else return [false, null];
  } catch (err) {
    if (err.response.status === 401) return [false, null];
    logger.error(
      `Error while checking if access token is valid: ${err.response.data}`
    );
    return [null, err.message];
  }
};
const getNewAccessToken = async (refresh_token) => {
  try {
    let URL = `https://auth.bullhornstaffing.com/oauth/token?client_id=${BULLHORN_CLIENT_ID}&client_secret=${BULLHORN_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refresh_token}`;
    const { data } = await axios.post(URL);
    let BH_data = await axios.post(
      `https://rest.bullhornstaffing.com/rest-services/login?version=*&access_token=${data.access_token}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    data.BhRestToken = BH_data.data.BhRestToken;
    data.restUrl = BH_data.data.restUrl.substring(
      0,
      BH_data.data.restUrl.length - 1
    );
    return [data, null];
  } catch (err) {
    console.log(err.response.data);
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

const BullhornTokenHelper = {
  fetchAccessToken,
  getNewAccessToken,
};

module.exports = BullhornTokenHelper;
