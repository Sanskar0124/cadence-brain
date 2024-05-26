// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  MAIL_INTEGRATION_TYPES,
  TRACKING_ACTIVITIES,
  TRACKING_REASONS,
} = require('../../utils/enums');

// Packages
const { google } = require('googleapis');
const sequelize = require('sequelize');

// DB
const Repository = require('../../repository');

// Helpers and Services
const Mail = require('../../services/Google/Mail');
const oauth2Client = require('../../services/Google/oathClient');
const OutlookService = require('../../services/Outlook/Mail');

const stopNotificationChannel = async (token) => {
  try {
    const oauth = oauth2Client.get(token);
    const gmail = google.gmail({ version: 'v1', auth: oauth });

    await gmail.users.stop({
      userId: 'me',
    });
    return [true, null];
  } catch (err) {
    logger.error(
      'Error occured while trying to stop previous google mail notification channels: ',
      err
    );
    return [null, err.message];
  }
};

/**
 * Sets primary email to null for users of the company,
 * Signs out user from Oauth service,
 * Deletes Webhook subscriptions,
 * Deletes tokens from database,
 * @param {string} integration_type existing mail integration type
 * @param {string} company_id company_id of the super admin company
 * @param {sequelize.Transaction} t sequelize transaction
 **/
const signOutUsersMail = async ({ integration_type, company_id, t }) => {
  try {
    const [users, errForUsers] = await Repository.fetchAll({
      tableName: DB_TABLES.USER,
      query: {
        company_id,
      },
      include: {
        [DB_TABLES.USER_TOKEN]: {
          required: true,
          attributes: [
            'google_refresh_token',
            'outlook_refresh_token',
            'outlook_mail_inbox_subscription_id',
            'outlook_mail_outbox_subscription_id',
            'outlook_calendar_subscription_id',
            'is_google_token_expired',
            'is_outlook_token_expired',
          ],
        },
      },
      extras: { attributes: ['user_id'] },
      t,
    });
    if (errForUsers) return [null, errForUsers];

    // set primary_email to null

    const [updateUser, errForUpdateUser] = await Repository.update({
      tableName: DB_TABLES.USER,
      query: {
        company_id,
      },
      updateObject: {
        primary_email: null,
      },
      t,
    });
    if (errForUpdateUser) return [null, errForUpdateUser];

    switch (integration_type) {
      case MAIL_INTEGRATION_TYPES.GOOGLE: {
        const signoutPromises = [];
        const notificationChannel = [];

        users.forEach((user) => {
          // Stop notification channel without waiting
          if (!user.User_Token.google_refresh_token) return;

          const stopNotificationChannelPromise = stopNotificationChannel(
            user.User_Token.google_refresh_token
          );

          notificationChannel.push(stopNotificationChannelPromise);

          // Signout google

          const signoutPromise = oauth2Client.signout(
            user.User_Token.google_refresh_token
          );
          signoutPromises.push(signoutPromise);
        });

        const [expireTokens, errForExpireTokens] = await Repository.update({
          tableName: DB_TABLES.USER_TOKEN,
          query: {},
          include: {
            [DB_TABLES.USER]: {
              where: {
                company_id,
              },
              required: true,
            },
          },
          updateObject: {
            encrypted_google_refresh_token: null,
            encrypted_google_mail_last_history_id: null,
            encrypted_google_calendar_sync_token: null,
            encrypted_google_calendar_channel_id: null,
            is_google_token_expired: true,
            //TODO: Make google_expiration_time : null
          },
          t,
        });
        if (errForExpireTokens) return [null, errForExpireTokens];

        users.forEach((user) => {
          if (!user.User_Token?.is_google_token_expired) {
            // if metadata is an array or is not an object, then change it to {} as metadata has type JSON in db
            if (Array.isArray(metadata) || typeof metadata !== 'object')
              metadata = {};
            Repository.create({
              tableName: DB_TABLES.TRACKING,
              createObject: {
                user_id: user.user_id,
                activity: TRACKING_ACTIVITIES.GOOGLE_SIGNED_OUT,
                reason: TRACKING_REASONS.SIGN_OUT_ALL_USERS,
                metadata,
              },
              t,
            });
          }
        });

        break;
      }

      case MAIL_INTEGRATION_TYPES.OUTLOOK: {
        const deleteSubscriptionPromises = [];

        users.forEach((user) => {
          // Delete subscriptions

          const deleteSubscriptionPromise =
            OutlookService.Subscriptions.deleteSub({
              refresh_token: user.User_Token.outlook_refresh_token,
              subscriptionIds: [
                user.User_Token.outlook_mail_inbox_subscription_id,
                user.User_Token.outlook_mail_outbox_subscription_id,
                user.User_Token.outlook_calendar_subscription_id,
              ],
            });

          deleteSubscriptionPromises.push(deleteSubscriptionPromise);
        });

        const [expireTokens, errForExpireTokens] = await Repository.update({
          tableName: DB_TABLES.USER_TOKEN,
          query: {},
          include: {
            [DB_TABLES.USER]: {
              where: {
                company_id,
              },
              required: true,
            },
          },
          updateObject: {
            encrypted_outlook_refresh_token: null,
            is_outlook_token_expired: true,
            is_google_token_expired: true,
            outlook_calendar_subscription_id: null,
            outlook_mail_inbox_subscription_id: null,
            outlook_mail_outbox_subscription_id: null,
          },
          t,
        });
        if (errForExpireTokens) return [null, errForExpireTokens];

        users.forEach((user) => {
          if (!user.User_Token?.is_outlook_token_expired) {
            // if metadata is an array or is not an object, then change it to {} as metadata has type JSON in db
            if (Array.isArray(metadata) || typeof metadata !== 'object')
              metadata = {};
            Repository.create({
              tableName: DB_TABLES.TRACKING,
              createObject: {
                user_id: user.user_id,
                activity: TRACKING_ACTIVITIES.OUTLOOK_SIGNED_OUT,
                reason: TRACKING_REASONS.SIGN_OUT_ALL_USERS,
                metadata,
              },
              t,
            });
          }
        });

        break;
      }

      default:
        return [null, `Bad integration type.`];
    }

    return [true, null];
  } catch (err) {
    logger.error(`Error while signing out users: `, err);
    return [null, err.message];
  }
};

module.exports = signOutUsersMail;
