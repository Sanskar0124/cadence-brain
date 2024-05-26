// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');
const { CRM_INTEGRATIONS, ZOHO_ENDPOINTS } = require('../../utils/enums');
const { SERVER_URL } = require('../../utils/config');

// Repositories
const UserTokenRepository = require('../../repository/user-token.repository');
// Services
const ZohoService = require('../../services/Zoho');
const { sequelize } = require('../../db/models');

// Helpers and Services
const AccessTokenHelper = require('../access-token');

const Repository = require('../../repository');
// const createCalendarChannel = require('../calendar/createNotificationChannel');

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

const CronRenewZohoNotificationChannel = async () => {
  try {
    logger.info('Running webhook renew for zoho...');

    // * Timestamp in one hour
    let timeAfterOneHour = new Date();
    timeAfterOneHour.addHours(1);

    // * Fetch all users whose tokens are expiring in the next 1 hr
    let [zohoTokens, errFetchingZohoTokens] = await Repository.fetchAll({
      tableName: DB_TABLES.ZOHO_TOKENS,
      query: {
        expiration: {
          [Op.lte]: timeAfterOneHour.getTime(),
        },
        is_logged_out: 0,
      },
      include: {
        [DB_TABLES.USER]: {
          required: true,
        },
      },
    });

    if (errFetchingZohoTokens) throw new Error(errFetchingZohoTokens);

    // * Renew notification channel for those users
    for (let zohoToken of zohoTokens) {
      const user_id = zohoToken.user_id;
      if (!zohoToken.User) continue;
      logger.info('Refreshing channel for: ' + zohoToken.User.first_name);
      const [{ access_token, instance_url }, errForAccessToken] =
        await AccessTokenHelper.getAccessToken({
          integration_type: CRM_INTEGRATIONS.ZOHO,
          user_id: zohoToken.User.user_id,
        });
      if (errForAccessToken) {
        logger.error(
          `An error occurred while trying to renew zoho webhook notification channel: `,
          errForAccessToken
        );
        continue;
      }
      const [zohoWebhooks, errDeletingZohoWebhook] = await Repository.destroy({
        tableName: DB_TABLES.ZOHO_WEBHOOK,
        query: {
          company_id: zohoToken.User.company_id,
        },
      });
      if (errDeletingZohoWebhook) {
        logger.error(
          'Something went wrong while deleting webhooks.',
          errDeletingZohoWebhook
        );
        continue;
      }

      await ZohoService.deleteWebhookById({
        access_token,
        instance_url,
      });
      // add webhook for all person events
      const date = new Date();
      let expirationDate = new Date(date.setDate(date.getDate() + 1));
      let expirationIsoDate = expirationDate.toISOString();
      let expiration = new Date(expirationIsoDate);
      expirationDate = expirationIsoDate
        .replace(/\.\d+/, '')
        .replace('Z', '+00:00');
      const channel_id = new Date().valueOf();
      const [createLeadWebhook, errForLeadWebhook] = await Repository.create({
        tableName: DB_TABLES.ZOHO_WEBHOOK,
        query: { user_id },
        createObject: {
          company_id: zohoToken.User.company_id,
          type: ZOHO_ENDPOINTS.LEAD,
          channel_id,
        },
      });
      if (errForLeadWebhook)
        logger.error(
          'Something went wrong while creating lead webhooks.',
          errForLeadWebhook
        );

      const [leadUpdateWebhookData, errForUpdateLeadWebhookData] =
        await ZohoService.createWebhook({
          access_token,
          instance_url,
          notify_url: `${SERVER_URL}/webhook/v1/zoho/lead`,
          channel_id: channel_id.toString(),
          channel_expiry: expirationDate,
          events: ['Leads.all'],
        });
      if (errForUpdateLeadWebhookData) {
        logger.error(
          'Something went wrong while creating lead webhooks.',
          errForUpdateLeadWebhookData
        );
        continue;
      }

      const channel_id1 = new Date().valueOf();
      const [createContactWebhook, errForContactWebhook] =
        await Repository.create({
          tableName: DB_TABLES.ZOHO_WEBHOOK,
          query: { user_id },
          createObject: {
            company_id: zohoToken.User.company_id,
            type: ZOHO_ENDPOINTS.CONTACT,
            channel_id: channel_id1,
          },
        });
      if (errForContactWebhook) {
        logger.error(
          'Something went wrong while creating contact webhooks.',
          errForContactWebhook
        );
        continue;
      }

      const [contactWebhookData, errForContactWebhookData] =
        await ZohoService.createWebhook({
          access_token,
          instance_url,
          notify_url: `${SERVER_URL}/webhook/v1/zoho/contact`,
          channel_id: channel_id1.toString(),
          channel_expiry: expirationDate,
          events: ['Contacts.all'],
        });
      if (errForContactWebhookData) {
        logger.error(
          'Something went wrong while creating contact webhooks.',
          errForContactWebhookData
        );
        continue;
      }

      // add webhook for all Account events
      const channel_id2 = new Date().valueOf();
      const [createAccountWebhook, errForAccountWebhook] =
        await Repository.create({
          tableName: DB_TABLES.ZOHO_WEBHOOK,
          query: { user_id },
          createObject: {
            company_id: zohoToken.User.company_id,
            type: ZOHO_ENDPOINTS.ACCOUNT,
            channel_id: channel_id2,
          },
        });
      if (errForAccountWebhook) {
        logger.error(
          'Something went wrong while creating account webhooks.',
          errForAccountWebhook
        );
        continue;
      }

      const [accountWebhookData, errForAccountWebhookData] =
        await ZohoService.createWebhook({
          access_token,
          instance_url,
          notify_url: `${SERVER_URL}/webhook/v1/zoho/account`,
          channel_id: channel_id2.toString(),
          channel_expiry: expirationDate,
          events: ['Accounts.all'],
        });
      if (errForAccountWebhookData) {
        logger.error(
          'Something went wrong while creating account webhooks.',
          errForAccountWebhookData
        );
        continue;
      }

      const [updatedUserToken, errForUserToken] = await Repository.update({
        tableName: DB_TABLES.ZOHO_TOKENS,
        query: { user_id: zohoToken.user_id },
        updateObject: {
          expiration: expiration,
        },
      });
      if (errForUserToken) {
        logger.error(
          `An error occurred while trying to renew zoho webhook notification channel: `,
          errForUserToken
        );
        continue;
      }
    }
    logger.info(
      'Successfully executed zoho webhook refresh notification channel'
    );
  } catch (err) {
    logger.error(
      `An error occurred while trying to renew zoho webhook notification channel: `,
      err
    );
  }
};

module.exports = CronRenewZohoNotificationChannel;
