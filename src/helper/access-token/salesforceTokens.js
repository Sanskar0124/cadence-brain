// Utils
const logger = require('../../utils/winston');
const {
  SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET,
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
    if (tokens.is_logged_out || !tokens.instance_url)
      return [
        {
          access_token: null,
          instance_url: null,
          integration_type: CRM_INTEGRATIONS.SALESFORCE,
        },
        'Kindly log in with salesforce.',
      ];

    // Checking is access token is valid
    const [valid, errForAccessToken] = await checkIfAccessTokenIsValid(
      tokens.access_token
    );
    if (errForAccessToken)
      return [
        {
          access_token: null,
          instance_url: null,
          integration_type: CRM_INTEGRATIONS.SALESFORCE,
        },
        errForAccessToken,
      ];

    // If old access token is valid, return the same
    if (valid)
      return [
        {
          access_token: tokens.access_token,
          instance_url: tokens.instance_url,
          integration_type: CRM_INTEGRATIONS.SALESFORCE,
        },
        null,
      ];

    const [data, errForNewAccessToken, detailedError] = await getNewAccessToken(
      tokens.refresh_token
    );
    if (errForNewAccessToken) {
      Repository.update({
        tableName: DB_TABLES.SALESFORCE_TOKENS,
        query: { user_id },
        updateObject: {
          is_logged_out: 1,
          encrypted_access_token: null,
          encrypted_refresh_token: null,
          encrypted_instance_url: null,
        },
      });
      const [sfCompanyUser, errForFetchSfCompanyUser] =
        await Repository.fetchOne({
          tableName: DB_TABLES.COMPANY_SETTINGS,
          query: { user_id },
          include: { [DB_TABLES.USER]: { attributes: ['email'] } },
          extras: { attributes: [] },
        });
      if (sfCompanyUser) {
        AmazonService.sendHtmlMails({
          subject:
            'IMPORTANT! Issue with your Salesforce connection with Cadence',
          body: HtmlHelper.reconnectCrmAdmin(
            `${FRONTEND_URL}/crm/salesforce/profile`,
            CRM_INTEGRATIONS.SALESFORCE
          ),
          emailsToSend: [sfCompanyUser.User.email],
        });
        // * Alert mail
        AmazonService.sendHtmlMails({
          subject: '[ERROR] : USER DISCONNECTED FROM CADENCE',
          body: `
            <html> 
              <body> 
                <p>User disconnected from cadence.</p>
                <p> Integration :  Salesforce </p>
                <p>User: ${sfCompanyUser?.User?.email}</p>
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
          instance_url: null,
          integration_type: CRM_INTEGRATIONS.SALESFORCE,
        },
        errForNewAccessToken,
      ];
    }

    const [accessToken, _] = CryptoHelper.encrypt(data.access_token);

    await Repository.update({
      tableName: DB_TABLES.SALESFORCE_TOKENS,
      query: { user_id },
      updateObject: {
        is_logged_out: 0,
        encrypted_access_token: accessToken,
      },
    });

    return [
      {
        access_token: data.access_token,
        instance_url: tokens.instance_url,
        integration_type: CRM_INTEGRATIONS.SALESFORCE,
      },
    ];
  } catch (err) {
    console.log(err);
    logger.error('Error while fetching salesforce access token: ', err);
    return [
      {
        access_token: null,
        instance_url: null,
        integration_type: CRM_INTEGRATIONS.SALESFORCE,
      },
      err.message,
    ];
  }
};

const checkIfAccessTokenIsValid = async (access_token) => {
  try {
    let URL = `https://login.salesforce.com/services/oauth2/userinfo`;
    const res = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (res.status === 200) return [true, null];
    else return [false, null];
  } catch (err) {
    if (['Bad_OAuth_Token', 'Missing_OAuth_Token'].includes(err.response.data))
      return [false, null];
    logger.error(
      `Error while checking if access token is valid: ${err.response.data}`
    );
    return [false, err.message];
  }
};

const getNewAccessToken = async (refresh_token) => {
  try {
    logger.info('[DEBUG] Fetching new salesforce tokens...');
    let URL = `https://login.salesforce.com/services/oauth2/token?client_id=${SALESFORCE_CLIENT_ID}&client_secret=${SALESFORCE_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refresh_token}`;
    const { data } = await axios.post(URL);
    logger.info('[DEBUG] Fetched new salesforce tokens');
    return [data, null, null]; //TODO: ADDED FOR EMAIL LOGGING
  } catch (err) {
    if (
      err?.response?.data?.error_description === 'expired access/refresh token'
    ) {
      logger.info('[DEBUG] EXPIRED ACCESS/REFRESH TOKEN.');
      logger.info(`[DEBUG]: REFRESH TOKEN: ${refresh_token}`);
      return [
        null,
        'expired access/refresh token',
        JSON.stringify(err.response.data, null, 2), //TODO: ADDED FOR EMAIL LOGGING
      ];
    }
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

const SalesforceTokenHelper = {
  fetchAccessToken,
  checkIfAccessTokenIsValid,
  getNewAccessToken,
};

module.exports = SalesforceTokenHelper;
