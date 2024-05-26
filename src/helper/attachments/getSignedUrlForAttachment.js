// Utils
const logger = require('../../utils/winston');

// Helpers
const StorageHelper = require('../../services/Google/Storage/index');

/** Returns signed url of attachment
 * @param {Object} attachment_id - Array of integers
 * @returns {Promise<[signedUrl: string, errForSignedUrl: Error]>}
 */
const getSignedUrlForAttachment = async (attachment) => {
  try {
    const [signedUrl, errForSignedUrl] =
      await StorageHelper.Bucket.getAttachmentSignedUrl(
        attachment.attachment_id,
        attachment.original_name
      );
    if (errForSignedUrl) return [null, errForSignedUrl];

    return [signedUrl.signedUrl, null];
  } catch (err) {
    logger.info(
      'An error occured while fetching signed url for attachment: ',
      err
    );
    return [null, err?.message];
  }
};

module.exports = getSignedUrlForAttachment;
