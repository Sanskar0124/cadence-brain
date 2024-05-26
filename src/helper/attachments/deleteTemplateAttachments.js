// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');

// Repositories
const Repository = require('../../repository');

// Helpers
const StorageHelper = require('../../services/Google/Storage/index');

/**
 * @param {Array} attachment_ids - Array of integers
 * @returns {Promise<Array>} [successMessage, errMessage]
 */
const deleteTemplateAttachments = async ({ et_id }) => {
  let t = await sequelize.transaction();
  try {
    // Fetch Attachments from Attachment Table
    const [deletableAttachments, errForDeletableAttachments] =
      await Repository.fetchAll({
        tableName: DB_TABLES.ATTACHMENT,
        query: {
          et_id,
        },
        extras: {
          attributes: ['attachment_id'],
        },
        t,
      });
    let deletableAttachmentIds = deletableAttachments?.map(
      (attachment) => attachment?.attachment_id
    );
    // Delete From Table
    const [deletedAttachments, errForDeletedAttachments] =
      await Repository.destroy({
        tableName: DB_TABLES.ATTACHMENT,
        query: {
          [Op.in]: deletableAttachmentIds,
        },
        t,
      });
    if (errForDeletedAttachments) {
      t.rollback();
      logger.error('Unable to delete attachments: ', errForDeletedAttachments);
      return [null, errForDeletedAttachments];
    }
    // Delete from GCP
    // On unforeseen occasions the GCP deletions may fail, in that case we will rely on GCP retention policy
    let deletablePromises = [];
    if (deletableAttachmentIds?.length > 0)
      deletablePromises = deletableAttachmentIds?.map((attachment_id) =>
        StorageHelper.Bucket.deleteAttachments(attachment_id)
      );
    await Promise.all(deletablePromises);
    t.commit();
    logger.info('Successfully deleted attachments');
    return ['Successfully deleted attachments', null];
  } catch (err) {
    t.rollback();
    logger.info('An error occured while deleting attachments: ', err);
    return [null, err?.message];
  }
};

module.exports = deleteTemplateAttachments;
