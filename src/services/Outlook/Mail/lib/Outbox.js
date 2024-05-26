// Utils
const logger = require('../../../../utils/winston');

// Packages
const axios = require('axios');

// Others
const oauth2Client = require('../../oauthClient');

const send = async ({ outlookRefreshToken, requestBody }) => {
  try {
    const [access_token, err] = await oauth2Client.getActiveAccessToken(
      outlookRefreshToken
    );
    if (err) {
      logger.error(`Outlook refresh token expired`);
      return [null, err];
    }
    logger.info(`Sending mail: ${requestBody}`);

    const response = await axios.post(
      `https://graph.microsoft.com/beta/me/sendMail`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const data = await response.data;
    // console.log(response, data);
    return [data, null];
  } catch (err) {
    logger.error(`Error in sending mail through outlook`, err);
    return [null, err.response?.data?.error?.message ?? err.message];
  }
};

const reply = async ({
  outlookRefreshToken,
  requestBody,
  toReplyMessageId,
}) => {
  try {
    const [access_token, err] = await oauth2Client.getActiveAccessToken(
      outlookRefreshToken
    );
    logger.info(`Sending mail: ${requestBody}`);

    if (err) {
      logger.info(`Outlook refresh token expired`);
      return [null, err];
    }
    const response = await axios.post(
      `https://graph.microsoft.com/v1.0/me/messages/${toReplyMessageId}/reply`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const data = await response.data;
    return [data, null];
  } catch (err) {
    logger.error(`Error in replying to mail`, err);
    return [null, err.response?.data?.error?.message ?? err.message];
  }
};

const Outbox = { send, reply };
module.exports = Outbox;
