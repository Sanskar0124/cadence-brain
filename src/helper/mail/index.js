const processAutomatedMail = require('./processAutomatedMail');
const processAutomatedReply = require('./processAutomatedReply');

// * Scheduled mails
const processScheduledMail = require('./processScheduledMail');
const processScheduledReply = require('./processScheduledReply');

const sendMail = require('./sendMail');
const sendReply = require('./sendReply');
const {
  parseMessagesDeleted,
  parseMessagesUpdated,
} = require('./parseHistory');
const { sync } = require('./sync');
const { getGenericMailFormat } = require('./mailFormat');
const {
  getEmailFromEntity,
  getBouncedMailAddressInOutlook,
} = require('./address');

const MailHelper = {
  processAutomatedMail,
  sendMail,
  processScheduledMail,
  processScheduledReply,
  parseMessagesDeleted,
  parseMessagesUpdated,
  sync,
  getGenericMailFormat,
  getEmailFromEntity,
  getBouncedMailAddressInOutlook,
  processAutomatedReply,
  sendReply,
};

module.exports = MailHelper;
