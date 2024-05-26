// Utils
const MailHelper = require('../../../../helper/mail');
const { INTEGRATION_TYPE } = require('../../../../utils/enums');
const logger = require('../../../../utils/winston');

// Packages
const axios = require('axios');

//Others
const { getActiveAccessToken } = require('../../oauthClient');

const getByMessageId = async ({
  outlookRefreshToken,
  messageId,
  attachments,
}) => {
  try {
    const [access_token, tokenErr] = await getActiveAccessToken(
      outlookRefreshToken
    );
    if (tokenErr) {
      logger.error(`Error in retrieving access token`);
      return [null, tokenErr];
    }

    const URL = `https://graph.microsoft.com/v1.0/me/messages/'${messageId}'`;
    const response = await axios.get(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });

    const mail = response.data;
    mail.attachments = [];
    if (attachments) {
      if (mail.hasAttachments) {
        const [attachments, attachmentsErr] = await getAllAttachmentsByMailId({
          outlookAccessToken: access_token,
          mailId: mail.id,
        });
        if (attachmentsErr) return [null, attachmentsErr];
        mail.attachments = attachments;
      }
    }

    const [genericMail, genericMailErr] = MailHelper.getGenericMailFormat({
      mail,
      integrationType: INTEGRATION_TYPE.OUTLOOK,
    });
    if (genericMailErr) return [null, genericMailErr];

    return [genericMail, null];
  } catch (err) {
    //Check for expired token
    logger.error(`Error in fetching outlook mail `, err);
    return [null, err];
  }
};

// const getAttachment = ({ outlookToken, messageId, attachmentId }) => {
//   return axios({
//     url: `https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments/${attachmentId}`,
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${outlookToken}`,
//     },
//   });
// };

const getAllAttachmentsByMailId = async ({ outlookAccessToken, mailId }) => {
  try {
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/me/messages/${mailId}/attachments`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${outlookAccessToken}`,
        },
      }
    );
    return [response.data.value, null];
  } catch (error) {
    logger.error(
      `Error in getAllAttachments: ${
        error?.response?.data?.error?.message ?? error.message
      }`,
      err
    );
    return [null, error];
  }
};

const Inbox = {
  // get,
  // getOneDay,
  // getOneWeek,
  // sync,
  // createNotificationChannel,
  getByMessageId,
  // getAttachment,
  getAllAttachmentsByMailId,
};

module.exports = Inbox;
