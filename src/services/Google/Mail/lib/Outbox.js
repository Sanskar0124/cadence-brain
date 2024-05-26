// Utils
const logger = require('../../../../utils/winston');
const { MAIL_SCOPE_LEVEL } = require('../../../../utils/enums');

// Packages
const { google } = require('googleapis');
const MailComposer = require('mailcomposer');

// Others
const OAuth2Client = require('../../oathClient');

const send = async ({
  token,
  requestBody,
  threadId,
  email_scope_level = MAIL_SCOPE_LEVEL.ADVANCE,
}) => {
  try {
    //GOOGLE
    console.log(requestBody);
    if (token.refresh_token === null) return [null, 'No refresh token!'];

    const oauth = OAuth2Client.get(token, email_scope_level);
    const gmail = google.gmail({ version: 'v1', auth: oauth });
    const mail = new MailComposer(requestBody);

    //enable bcc support
    mail.keepBcc = true;

    let mailData = await mailBuild(mail, gmail, threadId);

    logger.info(`Mail sent successfully.`);
    return [mailData.data, null];
  } catch (err) {
    // console.log('---err1: ', err);
    logger.error(`Error while sending mail:`, err);
    return [null, err.message];
  }
};

const mailBuild = (mail, gmail, threadId) => {
  return new Promise(async (resolve, reject) => {
    await mail.build(async (err, message) => {
      if (err) {
        // console.log('---err2: ', err);
        logger.error(`Error occurred while building mail: ${err.message}.`);
        reject(err);
      }
      let m;
      try {
        if (threadId)
          m = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: message?.toString('base64'), threadId },
          });
        else
          m = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: message?.toString('base64') },
          });
        resolve(m);
      } catch (error) {
        logger.error(`error while sending email`, error);
        reject(error);
      }
    });
  });
};

const Outbox = { send };
module.exports = Outbox;
