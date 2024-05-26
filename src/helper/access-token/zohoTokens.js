// Utils
const logger = require('../../utils/winston');
const {
  ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET,
  ZOHO_REDIRECT_URI,
  FRONTEND_URL,
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
    if (tokens.is_logged_out) {
      return [
        {
          access_token: null,
          instance_url: null,
          server_url: null,
          integration_type: CRM_INTEGRATIONS.ZOHO,
        },
        'Kindly log in to zoho.',
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
          integration_type: CRM_INTEGRATIONS.ZOHO,
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
          integration_type: CRM_INTEGRATIONS.ZOHO,
        },
        null,
      ];

    const [data, errForNewAccessToken] = await getNewAccessToken(
      tokens.server_url,
      tokens.refresh_token
    );
    if (errForNewAccessToken) {
      Repository.update({
        tableName: DB_TABLES.ZOHO_TOKENS,
        query: { user_id },
        updateObject: {
          is_logged_out: 1,
          encrypted_access_token: null,
          encrypted_refresh_token: null,
          encrypted_instance_url: null,
          encrypted_server_url: null,
        },
      });
      const [zohoCRMUser, errForFetchZCompanyUser] = await Repository.fetchOne({
        tableName: DB_TABLES.COMPANY_SETTINGS,
        query: { user_id },
        include: { [DB_TABLES.USER]: { attributes: ['email'] } },
        extras: { attributes: [] },
      });
      if (zohoCRMUser)
        AmazonService.sendHtmlMails({
          subject: 'IMPORTANT! Issue with your Zoho connection with Cadence',
          body: HtmlHelper.reconnectCrmAdmin(
            `${FRONTEND_URL}/crm/zoho/profile`,
            CRM_INTEGRATIONS.ZOHO
          ),
          emailsToSend: [zohoCRMUser.User.email],
        });
      return [
        {
          access_token: null,
          instance_url: null,
          server_url: null,
          integration_type: CRM_INTEGRATIONS.ZOHO,
        },
        errForNewAccessToken,
      ];
    }

    // Encrypting tokens
    const [accessToken, _] = CryptoHelper.encrypt(data.access_token);

    await Repository.update({
      tableName: DB_TABLES.ZOHO_TOKENS,
      query: { user_id },
      updateObject: {
        is_logged_out: 0,
        encrypted_access_token: accessToken,
        expires_in: data.expires_in,
      },
    });

    return [
      {
        access_token: data.access_token,
        instance_url: tokens.instance_url,
        server_url: tokens.server_url,
        integration_type: CRM_INTEGRATIONS.ZOHO,
      },
    ];
  } catch (err) {
    logger.error('Error while fetching zoho access token: ', err);
    return [
      {
        access_token: null,
        instance_url: null,
        server_url: null,
        integration_type: CRM_INTEGRATIONS.ZOHO,
      },
      err.message,
    ];
  }
};
const checkIfAccessTokenIsValid = async (access_token, instance_url) => {
  try {
    const res = await axios.get(
      `${instance_url}/crm/v2/users?type=CurrentUser`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
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
const getNewAccessToken = async (server_url, refresh_token) => {
  try {
    let URL = `${server_url}/oauth/v2/token?client_id=${ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refresh_token}`;
    const { data } = await axios.post(URL);
    return [data, null];
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
    ];
  }
};

const ZohoTokenHelper = {
  fetchAccessToken,
  checkIfAccessTokenIsValid,
  getNewAccessToken,
};

module.exports = ZohoTokenHelper;
