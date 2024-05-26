// utils
const { MAIL_INTEGRATION_TYPES } = require('../../utils/enums');
const logger = require('../../utils/winston');
// Others
const { getEmailFromEntity } = require('./address');

const getGenericMailFormat = ({ mail, integrationType, extras }) => {
  try {
    switch (integrationType) {
      case MAIL_INTEGRATION_TYPES.GOOGLE: {
        const newMailFormat = {
          id: mail.id,
          thread_id: mail.threadId,
          to: {
            address: getEmailFromEntity(mail.headers.to),
            name: mail.headers.to.substring(
              0,
              mail.headers.to.indexOf(
                '<' + getEmailFromEntity(mail.headers.to)
              ) - 1
            ),
          },
          from: {
            address: getEmailFromEntity(mail.headers.from),
            name: mail.headers.from.substring(
              0,
              mail.headers.from.indexOf(
                '<' + getEmailFromEntity(mail.headers.from)
              ) - 1
            ),
          },
          cc: mail.headers.cc, //normal emailAddresses
          bcc: mail.headers.bcc, //normal emailAddresses
          subject: mail.headers.subject,
          textHtml: mail.textHtml,
          replyTo: mail.headers['reply-to']
            ? {
                address: getEmailFromEntity(mail.headers['reply-to']),
                name: mail.headers['reply-to'].substring(
                  0,
                  mail.headers['reply-to'].indexOf(
                    '<' + getEmailFromEntity(mail.headers['reply-to'])
                  ) - 1
                ),
              }
            : null,
          attachments: mail.attachments
            ? mail.attachments.map((a) => ({
                name: a.filename,
                attachmentId: a.attachmentId,
                size: a.size,
                contentType: a.mimeType,
                data: a.data,
              }))
            : [],
          sent: mail.labelIds.includes('SENT'),
          received: mail.labelIds.includes('INBOX'),
          draft: mail.labelIds.includes('DRAFT'),
          createdAt: mail.internalDate, //UNIX TIMESTAMP
          failedRecipients: mail.headers?.['x-failed-recipients'],
          ...extras,
        };
        return [newMailFormat, null];
      }
      case MAIL_INTEGRATION_TYPES.OUTLOOK: {
        const newMailFormat = {
          id: mail.id,
          thread_id: mail.conversationId,
          to: {
            address: mail.toRecipients[0].emailAddress.address.toLowerCase(),
            name: mail.toRecipients[0].emailAddress.name,
          },
          from: {
            address: mail.from.emailAddress.address.toLowerCase(),
            name: mail.from.emailAddress.name,
          },
          subject: mail.subject,
          textHtml: mail.body.content,
          replyTo: mail?.replyTo[0]?.emailAddress.address.toLowerCase() ?? null,
          attachments: mail?.attachments.map((a) => ({
            name: a.name,
            attachmentId: a.id,
            size: a.size,
            contentType: a.contentType,
            data: a.contentBytes,
          })),
          sent: mail.isDeliveryReceiptRequested === null ? false : true, //isDeliveryReceiptRequested = false || true then mail is sent
          createdAt: new Date(mail.createdDateTime).getTime(),
          ...extras,
        };
        return [newMailFormat, null];
      }
    }
  } catch (err) {
    logger.error(`Error in converting mail format`, err);
    return [null, err.message];
  }
};

module.exports = { getGenericMailFormat };
