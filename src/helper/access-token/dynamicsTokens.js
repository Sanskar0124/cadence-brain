// Utils
const logger = require('../../utils/winston');
const {
  FRONTEND_URL,
  DYNAMICS_CLIENT_ID,
  DYNAMICS_CLIENT_SECRET,
} = require('../../utils/config');
const { CRM_INTEGRATIONS } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const axios = require('axios');
const { sequelize } = require('../../db/models');

// Repository
const Repository = require('../../repository');

// Helpers and Services
const HtmlHelper = require('../html');
const AmazonService = require('../../services/Amazon');
const CryptoHelper = require('../crypto');

const fetchAccessToken = async ({ user_id, tokens }) => {
  try {
    if (tokens.is_logged_out) {
      return [
        {
          instance_url: null,
          access_token: null,
          integration_type: CRM_INTEGRATIONS.DYNAMICS,
        },
        'Kindly log in to dynamics.',
      ];
    }
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
          integration_type: CRM_INTEGRATIONS.DYNAMICS,
        },
        errForAccessToken,
      ];

    // If old access token is valid, return the same
    if (valid)
      return [
        {
          access_token: tokens.access_token,
          instance_url: tokens.instance_url,
          integration_type: CRM_INTEGRATIONS.DYNAMICS,
        },
        null,
      ];
    const [data, errForNewAccessToken] = await getNewAccessToken(
      user_id,
      tokens.refresh_token,
      tokens.instance_url
    );
    if (errForNewAccessToken) {
      Repository.update({
        tableName: DB_TABLES.DYNAMICS_TOKENS,
        query: { user_id },
        updateObject: {
          is_logged_out: 1,
          encrypted_refresh_token: null,
          encrypted_access_token: null,
        },
      });

      const [dynamicsUser, errForDynamicsUser] = await Repository.fetchOne({
        tableName: DB_TABLES.COMPANY_SETTINGS,
        query: { user_id },
        include: { [DB_TABLES.USER]: { attributes: ['email'] } },
        extras: { attributes: [] },
      });
      if (dynamicsUser)
        AmazonService.sendHtmlMails({
          subject:
            'IMPORTANT! Issue with your Dynamics connection with Cadence',
          body: HtmlHelper.reconnectCrmAdmin(
            `${FRONTEND_URL}/crm/dynamics/profile`,
            CRM_INTEGRATIONS.DYNAMICS
          ),
          emailsToSend: [dynamicsUser.User.email],
        });
      return [
        {
          access_token: null,
          instance_url: null,
          integration_type: CRM_INTEGRATIONS.DYNAMICS,
        },
        errForNewAccessToken,
      ];
    }

    return [
      {
        access_token: data.access_token,
        instance_url: tokens.instance_url,
        integration_type: CRM_INTEGRATIONS.DYNAMICS,
      },
      null,
    ];
  } catch (err) {
    logger.error('Error while fetching dynamics access token: ', err);
    return [
      {
        access_token: null,
        instance_url: null,
        integration_type: CRM_INTEGRATIONS.DYNAMICS,
      },
      err.message,
    ];
  }
};

const checkIfAccessTokenIsValid = async (instance_url, access_token) => {
  try {
    const res = await axios.get(`${instance_url}/api/data/v9.2/WhoAmI`, {
      headers: {
        'If-None-Match': 'null',
        'OData-Version': '4.0',
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'OData-MaxVersion': '4.0',
        Authorization: `Bearer ${access_token}`,
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

const getNewAccessToken = async (user_id, refresh_token, instance_url) => {
  let t = await sequelize.transaction();
  try {
    const params = new URLSearchParams();
    params.append('client_id', DYNAMICS_CLIENT_ID);
    params.append('client_secret', DYNAMICS_CLIENT_SECRET);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refresh_token);
    params.append(
      'scope',
      `${instance_url}/user_impersonation offline_access openid profile User.Read`
    );

    const { data } = await axios.post(
      'https://login.microsoftonline.com/organizations/oauth2/v2.0/token',
      params,
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      }
    );

    // Encrypting tokens
    const [accessToken, _] = CryptoHelper.encrypt(data.access_token);
    const [refreshToken, __] = CryptoHelper.encrypt(data.refresh_token);

    const [updateLogStatus, errForUpdateLogStatus] = await Repository.update({
      tableName: DB_TABLES.DYNAMICS_TOKENS,
      query: { user_id },
      updateObject: {
        encrypted_access_token: accessToken,
        encrypted_refresh_token: refreshToken,
        is_logged_out: 0,
      },
      t,
    });
    if (errForUpdateLogStatus) {
      t.rollback();
      return [null, errForUpdateLogStatus];
    }

    t.commit();
    return [
      {
        access_token: data.access_token,
        integration_type: CRM_INTEGRATIONS.DYNAMICS,
      },
      null,
    ];
  } catch (err) {
    t.rollback();
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

const DynamicsTokenHelper = {
  fetchAccessToken,
  getNewAccessToken,
};

module.exports = DynamicsTokenHelper;
