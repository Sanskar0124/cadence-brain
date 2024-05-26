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
const deleteAttachments = async ({ attachment_ids }) => {
  let t = await sequelize.transaction();
  try {
    // Delete From Table
    const [deletedAttachments, errForDeletedAttachments] =
      await Repository.destroy({
        tableName: DB_TABLES.ATTACHMENT,
        query: {
          attachment_id: {
            [Op.in]: attachment_ids,
          },
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
    if (attachment_ids.length > 0)
      deletablePromises = attachment_ids?.map((attachment_id) =>
        StorageHelper.Bucket.deleteAttachments(attachment_id?.toString())
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

module.exports = deleteAttachments;
