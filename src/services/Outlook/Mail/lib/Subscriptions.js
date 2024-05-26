// Utils
const config = require('../../../../utils/config');
const logger = require('../../../../utils/winston');

// Packages
const axios = require('axios');

// Others
const oauth2Client = require('../../oauthClient');

const expirationMinutesFromNow = 24 * 60 * 3 - 60;

const getExpirationDateTime = (minutesToAdd) => {
  var currentDate = new Date();
  var expirationDate = new Date(
    currentDate.getTime() + minutesToAdd * 60000
  ).toISOString();
  return expirationDate;
}; //returns 2days and 23 hours from now

const create = async ({ refresh_token, user_id }) => {
  try {
    const [outlookAccessToken, err] = await oauth2Client.getActiveAccessToken(
      refresh_token
    );
    if (err) {
      logger.error(`Refresh Token expired`);
      return [null, err];
    }

    const URL = 'https://graph.microsoft.com/v1.0/subscriptions';
    var expirationDate = getExpirationDateTime(expirationMinutesFromNow);
    const requestBodyForInboxMailSubscription = {
      changeType: 'created,deleted',
      notificationUrl:
        config.SERVER_URL + `/mail/v2/outlook/webhook/inbox/${user_id}`,
      lifecycleNotificationUrl:
        config.SERVER_URL + `/mail/v2/outlook/webhook-lifecycle/${user_id}`,
      resource: "me/mailFolders('Inbox')/messages",
      expirationDateTime: expirationDate,
      clientState: JSON.stringify({ user_id }),
    };
    const requestBodyForOutboxMailSubscription = {
      changeType: 'created,deleted',
      notificationUrl:
        config.SERVER_URL + `/mail/v2/outlook/webhook/outbox/${user_id}`,
      lifecycleNotificationUrl:
        config.SERVER_URL + `/mail/v2/outlook/webhook-lifecycle/${user_id}`,
      resource: "me/mailFolders('sentItems')/messages",
      expirationDateTime: expirationDate,
      clientState: JSON.stringify({ user_id }),
    };
    const requestBodyForCalendarSubscription = {
      changeType: 'created,deleted,updated',
      notificationUrl:
        config.SERVER_URL + `/calendar/v2/outlook/webhook/${user_id}`,
      lifecycleNotificationUrl:
        config.SERVER_URL + `/calendar/v2/outlook/webhook-lifecycle/${user_id}`,
      resource: 'me/events',
      expirationDateTime: expirationDate,
      clientState: JSON.stringify({ user_id }),
    };
    const headers = {
      Authorization: 'Bearer ' + outlookAccessToken,
      'Content-Type': 'application/json',
    };

    const inboxMailSubRes = await axios.post(
      URL,
      requestBodyForInboxMailSubscription,
      {
        headers,
      }
    );

    const outboxMailSubRes = await axios.post(
      URL,
      requestBodyForOutboxMailSubscription,
      {
        headers,
      }
    );

    const calendarSubRes = await axios.post(
      URL,
      requestBodyForCalendarSubscription,
      { headers }
    );
    const data = {
      inboxMailSub: inboxMailSubRes.data,
      outboxMailSub: outboxMailSubRes.data,
      calendarSub: calendarSubRes.data,
    };
    return [data, null];
  } catch (err) {
    logger.error(
      `Error in creating subscription: ${
        err?.response?.data?.error?.message ?? err.message
      }`,
      err
    );
    return [null, err?.response?.data?.error?.message ?? err.message];
  }
};

const renew = async ({ refresh_token, subscriptionId }) => {
  try {
    const [outlookAccessToken, err] = await oauth2Client.getActiveAccessToken(
      refresh_token
    );
    if (err) {
      logger.error(`Refresh Token expired`);
      return [null, err];
    }

    const URL = `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`;
    const requestBody = {
      expirationDateTime: getExpirationDateTime(expirationMinutesFromNow),
    };
    const headers = {
      Authorization: 'Bearer ' + outlookAccessToken,
      'Content-Type': 'application/json',
    };

    const response = await axios.patch(URL, requestBody, { headers });
    const data = response.data;

    return [data, null];
  } catch (err) {
    logger.error(
      `Error in renewing subscription: ${
        err.response?.data?.error?.message ?? err.message
      }`,
      err
    );
    return [null, err.response?.data?.error?.message ?? err.message];
  }
};

const deleteSub = async ({ refresh_token, subscriptionIds }) => {
  try {
    const [outlookAccessToken, err] = await oauth2Client.getActiveAccessToken(
      refresh_token
    );
    if (err) {
      logger.error(`Refresh Token expired`);
      return [null, err];
    }

    await subscriptionIds.forEach(async (subId) => {
      if (!subId) return;

      const URL = `https://graph.microsoft.com/v1.0/subscriptions/${subId}`;

      const headers = {
        Authorization: 'Bearer ' + outlookAccessToken,
        'Content-Type': 'application/json',
      };

      await axios.delete(URL, { headers });
    });

    return ['Subscriptions are removed', null];
  } catch (err) {
    logger.error(
      `Error in deleting subscription: ${
        err.response?.data?.error?.message ?? err.message
      }`,
      err
    );
    return [null, err.response?.data?.error?.message ?? err.message];
  }
};

module.exports = {
  create,
  renew,
  deleteSub,
};
