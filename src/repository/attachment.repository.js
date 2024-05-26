// Utils
const logger = require('../utils/winston');

// Models
const { Attachment } = require('../db/models');

const createAttachment = async ({
  et_id,
  original_name,
  content,
  content_type,
}) => {
  try {
    const attachment = await Attachment.create({
      original_name,
      content,
      content_type,
      et_id,
    });
    return [attachment, null];
  } catch (err) {
    logger.error(err.message);
    return [null, err];
  }
};

const createMultipleAttachment = async (attachments) => {
  try {
    const createdAttachments = await Attachment.bulkCreate(attachments);
    return [createdAttachments, null];
  } catch (err) {
    logger.error(err.message);
    return [null, err.message];
  }
};

const deleteAllEtIdAttachments = async (et_id) => {
  try {
    const deletedAttachments = await Attachment.destroy({
      where: {
        et_id,
      },
    });
    return [deletedAttachments, null];
  } catch (err) {
    logger.error(err.message);
    return [null, err];
  }
};

const getAttachments = async (query) => {
  try {
    const attachments = await Attachment.findAll({
      where: query,
    });

    return [attachments, null];
  } catch (err) {
    logger.error(`Error while retreiving attachments: ${err.message}.`);
    return [null, err.message];
  }
};

const AttachmentRepository = {
  createAttachment,
  createMultipleAttachment,
  deleteAllEtIdAttachments,
  getAttachments,
};

module.exports = AttachmentRepository;
