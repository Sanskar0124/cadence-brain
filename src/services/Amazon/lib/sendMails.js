// Utils
const logger = require('../../../utils/winston');
const { SES_ACCESS_KEY_ID, SES_SECRET_KEY } = require('../../../utils/config');

// Packages
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: SES_ACCESS_KEY_ID,
  secretAccessKey: SES_SECRET_KEY,
  region: 'eu-west-3',
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

const sendMails = async ({ subject = '', body, emailsToSend }) => {
  let params = {
    Destination: {
      BccAddresses: [],
      CcAddresses: [],
      ToAddresses: emailsToSend,
    },
    Message: {
      Body: {
        //Html: {
        //Charset: 'UTF-8',
        //Data: msg,
        //},
        Text: {
          Charset: 'UTF-8',
          Data: body,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: 'cadence@ringover.com',
  };

  const sendEmail = ses.sendEmail(params).promise();

  try {
    const mail = await sendEmail;
    console.log(mail);
    return [mail, null];
  } catch (err) {
    logger.error('Error while sending mails via AWS SES: ', err);
    return [null, err.message];
  }
};

module.exports = sendMails;
