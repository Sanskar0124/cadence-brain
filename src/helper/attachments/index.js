const deleteTemplateAttachments = require('./deleteTemplateAttachments');
const deleteAttachments = require('./deleteAttachments');
const getSignedUrlForAttachment = require('./getSignedUrlForAttachment');

const AttachmentHelper = {
  deleteTemplateAttachments,
  deleteAttachments,
  getSignedUrlForAttachment,
};
module.exports = AttachmentHelper;
