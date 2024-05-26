// Utils
const logger = require('../../../../utils/winston');
const {
  INTEGRATION_TYPE,
  TRACKING_ACTIVITIES,
  TRACKING_REASONS,
} = require('../../../../utils/enums');
const { DB_TABLES } = require('../../../../utils/modelEnums');

// Helpers and Services
const { getGenericMailFormat } = require('../../../../helper/mail/mailFormat');
const CryptoHelper = require('../../../../helper/crypto');

// Packages
const { google } = require('googleapis');
const parseGmailMessage = require('gmail-api-parse-message');

// Repository
const Repository = require('../../../../repository');

// Others
const OAuth2Client = require('../../oathClient');

const getByMessageId = async ({ token, message_id, attachments }) => {
  try {
    const oauth = OAuth2Client.get(token);
    const gmail = google.gmail({ version: 'v1', auth: oauth });
    let response = await gmail.users.messages.get({
      id: message_id,
      userId: 'me',
    });
    let mail = response.data;

    mail = parseGmailMessage(mail);

    if (!mail || !mail.labelIds) {
      return [null, 'Error in parsing mail through node package'];
    }

    if (attachments) {
      if (mail.attachments) {
        const promiseArray = [];
        mail.attachments.forEach((m) =>
          promiseArray.push(
            getAttachment({
              token,
              message_id,
              attachmentId: m.attachmentId,
            })
          )
        );

        let result = await Promise.all(promiseArray);

        for (let i = 0; i < result?.length; i++) {
          mail.attachments[i] = { ...mail.attachments[i], ...result[i] };
        }
      }
    }

    const [genericMail, genericMailErr] = getGenericMailFormat({
      mail,
      integrationType: INTEGRATION_TYPE.GOOGLE,
      extras: {
        replyMessageId: mail.headers?.['message-id'],
      },
    });

    if (genericMailErr) return [null, genericMailErr];

    return [genericMail, null];
  } catch (err) {
    logger.error(`Error while getting email by message id: ${err.message}`);
    return [null, err.message];
  }
};

const getFromQuery = async (token, q) => {
  const oauth = OAuth2Client.get(token);
  const gmail = google.gmail({ version: 'v1', auth: oauth });
  try {
    const body = await gmail.users.messages.list({
      userId: 'me',
      q,
      maxResults: 500,
    });

    if (body.data.resultSizeEstimate == 0) {
      return [[], null];
    }

    //TODO: Make use of nextPageToken in case emails exchanged > 500
    //      Highly unlikely it would be needed though
    let { nextPageToken, messages } = body.data;
    let promiseArray = messages.map((message) =>
      gmail.users.messages.get({ id: message.id, userId: 'me' })
    );
    let results = await Promise.all(promiseArray);
    results = results.map((res) => parseGmailMessage(res.data));

    return [results, null];
  } catch (e) {
    logger.error(e);
    return [null, e];
  }
};

const get = async (token, { after, before, fromEmail, period, getSent }) => {
  let q = '';

  if (getSent) {
    q = 'in:sent ';
    if (fromEmail) {
      q += `to:${fromEmail} `;
    }
  } else if (fromEmail) {
    q += `from:${fromEmail} `;
  }

  if (after) {
    q += `after:${after} `;
  }

  if (before) {
    q += `before:${before} `;
  }

  if (period) {
    q += `newer_than:${period}`;
  }
  return getFromQuery(token, q);
};

const getOneDay = (token, fromEmail, getSent = false) => {
  return get(token, { fromEmail, period: '1d', getSent });
};

const getOneWeek = (token, fromEmail, getSent = false) => {
  return get(token, { fromEmail, period: '7d', getSent });
};

const sync = async (token, startHistoryId) => {
  //TODO:DIFF_EMAIL_SCOPE
  const oauth = OAuth2Client.get(token);
  const gmail = google.gmail({ version: 'v1', auth: oauth });
  try {
    const response = await gmail.users.history.list({
      userId: 'me',
      startHistoryId,
      maxResults: 500,
    });
    return [response.data.history || [], null];
  } catch (e) {
    return [null, e];
  }
};

const createNotificationChannel = async (token) => {
  //TODO:DIFF_EMAIL_SCOPE
  const oauth = OAuth2Client.get(token);
  const gmail = google.gmail({ version: 'v1', auth: oauth });
  try {
    await gmail.users.stop({
      userId: 'me',
    });
  } catch (e) {
    console.log(e);

    const [encryptedToken, errForEncryptedToken] = CryptoHelper.encrypt(
      token.refresh_token
    );
    if (errForEncryptedToken) encryptedToken = null;

    if (encryptedToken) {
      const [userToken, errForUserToken] = await Repository.fetchOne({
        tableName: DB_TABLES.USER_TOKEN,
        query: {
          encrypted_google_refresh_token: encryptedToken,
        },
      });

      const [expireTokens, errForExpireTokens] = await Repository.update({
        tableName: DB_TABLES.USER_TOKEN,
        query: {
          user_token_id: userToken.user_token_id,
        },
        updateObject: {
          encrypted_google_refresh_token: null,
          encrypted_google_mail_last_history_id: null,
          encrypted_google_calendar_sync_token: null,
          encrypted_google_calendar_channel_id: null,
          is_google_token_expired: true,
        },
      });
      if (errForExpireTokens) {
        logger.error(`Error while expiring tokens: `, errForEncrpytedToken);
      }

      if (expireTokens[0] === 1) {
        Repository.create({
          tableName: DB_TABLES.TRACKING,
          createObject: {
            user_id: userToken.user_id,
            activity: TRACKING_ACTIVITIES.GOOGLE_SIGNED_OUT,
            reason: TRACKING_REASONS.ERROR_WHILE_RENEW_CHANNEL,
            metadata: {
              controller: `Service: createNotificationChannel: Stop`,
            },
          },
        });
      }
    }
    logger.error(
      'An error occurred while trying to stop previous google mail notification channels',
      e
    );
  }
  try {
    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX', 'SENT'],
        topicName: 'projects/apt-cubist-307713/topics/crm-gmail',
      },
    });

    return [response.data, null];
  } catch (err) {
    console.log(err);

    const [encryptedToken, errForEncryptedToken] = CryptoHelper.encrypt(
      token.refresh_token
    );
    if (errForEncryptedToken) encryptedToken = null;

    if (encryptedToken) {
      const [userToken, errForUserToken] = await Repository.fetchOne({
        tableName: DB_TABLES.USER_TOKEN,
        query: {
          encrypted_google_refresh_token: encryptedToken,
        },
      });

      const [expireTokens, errForExpireTokens] = await Repository.update({
        tableName: DB_TABLES.USER_TOKEN,
        query: {
          user_token_id: userToken.user_token_id,
        },
        updateObject: {
          encrypted_google_refresh_token: null,
          encrypted_google_mail_last_history_id: null,
          encrypted_google_calendar_sync_token: null,
          encrypted_google_calendar_channel_id: null,
          is_google_token_expired: true,
        },
      });
      if (errForExpireTokens) {
        logger.error(`Error while expiring tokens: `, errForEncrpytedToken);
      }

      if (expireTokens[0] === 1) {
        Repository.create({
          tableName: DB_TABLES.TRACKING,
          createObject: {
            user_id: userToken.user_id,
            activity: TRACKING_ACTIVITIES.GOOGLE_SIGNED_OUT,
            reason: TRACKING_REASONS.ERROR_WHILE_RENEW_CHANNEL,
            metadata: {
              controller: `Service: createNotificationChannel: Watch`,
            },
          },
        });
      }
    }

    logger.error('Error while creating notification channel: ', err.message);
    return [null, err.message];
  }
};

const getAttachment = async ({ token, message_id, attachmentId }) => {
  //TODO:DIFF_EMAIL_SCOPE
  const oauth = OAuth2Client.get(token);
  const gmail = google.gmail({ version: 'v1', auth: oauth });
  const response = await gmail.users.messages.attachments.get({
    userId: 'me',
    messageId: message_id,
    id: attachmentId,
  });
  return response.data;
};

const Inbox = {
  getFromQuery,
  get,
  getOneDay,
  getOneWeek,
  sync,
  createNotificationChannel,
  getByMessageId,
  getAttachment,
};

module.exports = Inbox;
