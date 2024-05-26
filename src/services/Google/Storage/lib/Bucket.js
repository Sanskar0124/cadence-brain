// Utils
const logger = require('../../../../utils/winston');

const { Storage } = require('@google-cloud/storage');
const File = require('./File');
const CONSTANTS = require('./constants');
const {
  _getFileName,
  _getSubDepartmentImageName,
  _getVideoFileName,
  _getThumbnailName,
  _getImageName,
  _getAttachmentFileName,
  _getAttachmentFolderName,
} = require('./_getFileName');
const Repository = require('../../../../repository');
const { DB_TABLES } = require('../../../../utils/modelEnums');

const storage = new Storage({
  projectId: CONSTANTS.PROJECT_ID,
  keyFilename: './service-account.json',
});

const upload = async (buffer, user_id) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const file = bucket.file(_getFileName(user_id));
    await file.save(buffer, {
      public: true,
      metadata: {
        cacheControl: 'no-store',
      },
    });
    return [File.url(user_id), null];
  } catch (err) {
    logger.error(`An error occurred while uploading`, err);
    return [null, err];
  }
};

const uploadSubdepartmentProfilePicture = async (buffer, subdepartment_id) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const file = bucket.file(_getSubDepartmentImageName(subdepartment_id));
    await file.save(buffer, {
      public: true,
      metadata: {
        cacheControl: 'no-store',
      },
    });
    return [file.publicUrl(), null];
  } catch (err) {
    logger.error(
      `An error occurred while uploading Sub department profile picture`,
      err
    );
    return [null, err.message];
  }
};

const uploadThumbnail = async (buffer, thumbnail_name) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const file = bucket.file(_getThumbnailName(thumbnail_name));
    const blobStream = file.createWriteStream({ resumable: false });
    blobStream.end(buffer);
    return [File.thumnailUrl(thumbnail_name), null];
  } catch (err) {
    logger.error(`An error occurred while uploading thumbnail`, err);
    return [null, err.message];
  }
};

const deleteThumbnail = async (thumbnail_name) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const file = bucket.file(_getThumbnailName(thumbnail_name));
    await file.delete();

    return ['thumbnail deleted', null];
  } catch (err) {
    logger.error(`An error occurred while deleting thumbnail`, err);
    return [null, err.message];
  }
};

const duplicateThumbnail = async (thumbnail_name, new_thumbnail_name) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const copyDestination = bucket.file(_getThumbnailName(new_thumbnail_name));
    const copyOptions = {
      preconditionOpts: {
        ifGenerationMatch: 0,
      },
    };
    await bucket
      .file(_getThumbnailName(thumbnail_name))
      .copy(copyDestination, copyOptions);

    return ['thumbnail duplicated', null];
  } catch (err) {
    logger.error(`An error occurred while duplicating thumbnail`, err);
    return [null, err.message];
  }
};

const uploadVideo = async (buffer, video_name) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const blob = bucket.file(_getVideoFileName(video_name));
    const blobStream = blob.createWriteStream({ resumable: false });
    blobStream.end(buffer);

    return [File.videoUrl(video_name), null];
  } catch (err) {
    logger.error(`An error occurred while uploading video`, err);
    return [null, err.message];
  }
};

const video = async (video_name) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const file = bucket.file(_getVideoFileName(video_name));

    return [file, null];
  } catch (err) {
    logger.error(`An error occurred while getting video file`, err);
    return [null, err.message];
  }
};

const deleteVideo = async (video_name) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const file = bucket.file(_getVideoFileName(video_name));
    await file.delete();

    return ['video deleted', null];
  } catch (err) {
    logger.error(`An error occurred while deleting video`, err);
    return [null, err.message];
  }
};

const duplicateVideo = async (video_name, new_video_name) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const copyDestination = bucket.file(_getVideoFileName(new_video_name));
    const copyOptions = {
      preconditionOpts: {
        ifGenerationMatch: 0,
      },
    };
    await bucket
      .file(_getVideoFileName(video_name))
      .copy(copyDestination, copyOptions);

    return ['video duplicated', null];
  } catch (err) {
    logger.error(`An error occurred while duplicating video`, err);
    return [null, err.message];
  }
};

const uploadImage = async (buffer, fileName) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const file = bucket.file(_getImageName(fileName));
    await file.save(buffer, {
      public: true,
      metadata: {
        cacheControl: 'no-store',
      },
    });
    return [
      {
        name: file.metadata.name,
        url: file.publicUrl(),
      },
      null,
    ];
  } catch (err) {
    logger.error(`Error while uploading image: `, err);
    return [null, err.message];
  }
};

const deleteFile = async (fileName) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const file = bucket.file(fileName);
    await file.delete();

    return ['File Deleted', null];
  } catch (err) {
    logger.error(`Error while deleting file: `, err);
    return [null, err.message];
  }
};

// * Upload attachments to private bucket
const uploadAttachments = async (buffer, attachment_id, original_name) => {
  try {
    // * Attachments will be uploaded to private bucket

    const options = {
      destination: attachment_id,
    };
    const bucket = storage.bucket(CONSTANTS.PRIVATE_BUCKET_NAME);
    const file = bucket.file(
      _getAttachmentFileName(attachment_id, original_name)
    );

    const blobStream = file.createWriteStream({
      resumable: false,
    });

    blobStream.end(buffer);

    // Wait for the write stream to finish
    await new Promise((resolve, reject) => {
      blobStream.on('finish', resolve);
      blobStream.on('error', reject);
    });

    return [true, null];
  } catch (err) {
    logger.error(`Error while uploading image: `, err);
    return [null, err.message];
  }
};

const duplicateAttachment = async (
  attachment_id,
  new_attachment_id,
  original_name
) => {
  try {
    const bucket = storage.bucket(CONSTANTS.PRIVATE_BUCKET_NAME);
    const copyDestination = bucket.file(
      _getAttachmentFileName(new_attachment_id, original_name)
    );
    const copyOptions = {
      preconditionOpts: {
        ifGenerationMatch: 0,
      },
    };
    await bucket
      .file(_getAttachmentFileName(attachment_id, original_name))
      .copy(copyDestination, copyOptions);

    logger.info(`Successfully duplicated attachment: ${original_name}`);
    return ['File duplicated', null];
  } catch (err) {
    logger.error(`Error while duplicating file: `, err);
    return [null, err.message];
  }
};

const deleteAttachments = async (attachment_id) => {
  try {
    const bucket = storage.bucket(CONSTANTS.PRIVATE_BUCKET_NAME);
    const [files] = await bucket.getFiles({
      prefix: _getAttachmentFolderName(attachment_id) + '/',
    });

    files.forEach(async (file) => {
      await file.delete();
      logger.info(`Successfully deleted file: ${file.name}`);
    });

    return ['File Deleted', null];
  } catch (err) {
    logger.error(`Error while deleting file: `, err);
    return [null, err.message];
  }
};

const downloadToMemory = async (name, attachment_id) => {
  try {
    const fileContents = await storage
      .bucket(CONSTANTS.BUCKET_NAME)
      .file(_getAttachmentFileName(attachment_id))
      .download();
    let file = {
      name,
      fileContents,
    };
    return [file, null];
  } catch (err) {
    logger.error(`Error while downloading file to memory`, err);
    return [
      null,
      `Could not download attachment with id: ${attachment_id} because of ${err?.message}`,
    ];
  }
};

const uploadSvg = async (svgString, user_id) => {
  try {
    const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
    const file = bucket.file(_getFileName(user_id));

    await file.save(svgString, {
      public: true,
      metadata: {
        cacheControl: 'no-store',
        contentType: 'image/svg+xml',
      },
    });
    return [File.url(user_id), null];
  } catch (err) {
    logger.error(`An error occurred while uploading`, err);
    return [null, err];
  }
};

/**
 * Creates signed url for attachment from private bucket
 * @param {Number} attachment_id attachment id
 * @param {String} original_name original name for attachment
 * @param {Number} expiresIn Minutes until signed url expires, defaults to 15 minutes
 * @returns {Promise<[{ originalName: string, signedUrl: string },Error]>} signed url for attachment
 */
const getAttachmentSignedUrl = async (
  attachment_id,
  original_name = null,
  expiresIn = 15
) => {
  try {
    if (!attachment_id) return [null, `Attachment id not found`];

    if (!original_name) {
      const [attachment, errForAttachment] = await Repository.fetchOne({
        tableName: DB_TABLES.ATTACHMENT,
        query: {
          attachment_id,
        },
      });
      if (errForAttachment) return [null, errForAttachment];

      original_name = attachment.original_name;
    }

    const options = {
      version: 'v4',
      action: 'read',
      virtualHostedStyle: true,
      expires: Date.now() + expiresIn * 60 * 1000, // 15 minutes by default
    };

    const file = storage
      .bucket(CONSTANTS.PRIVATE_BUCKET_NAME)
      .file(_getAttachmentFileName(attachment_id, original_name));

    const signedUrl = await file.getSignedUrl(options);

    return [
      {
        originalName: original_name,
        signedUrl: signedUrl?.[0],
      },
      null,
    ];
  } catch (err) {
    logger.error(`Error while getting signed url`, err);
    return [
      null,
      `Error while fetching signed url for attachment with id: ${attachment_id}:  ${err?.message}`,
    ];
  }
};
/**
 * Downloads file from private bucket to memory
 * @param {string} name name for the file
 * @param {Number} attachment_id attachment id
 * @returns {Promise<[{name: string, fileContents: Buffer},Error]>} Object with name and fileContents
 */
const downloadPrivateFileToMemory = async (name, attachment_id) => {
  try {
    const fileContents = await storage
      .bucket(CONSTANTS.PRIVATE_BUCKET_NAME)
      .file(_getAttachmentFileName(attachment_id, name))
      .download();
    let file = {
      name,
      fileContents,
    };

    return [file, null];
  } catch (err) {
    logger.error(`Error while downloading private file to memory`, err);
    return [
      null,
      `Could not download attachment with id: ${attachment_id} because of ${err?.message}`,
    ];
  }
};

const Bucket = {
  upload,
  uploadSubdepartmentProfilePicture,
  uploadThumbnail,
  deleteThumbnail,
  duplicateThumbnail,
  uploadVideo,
  video,
  deleteVideo,
  duplicateVideo,
  uploadImage,
  deleteFile,
  uploadAttachments,
  deleteAttachments,
  downloadToMemory,
  uploadSvg,
  getAttachmentSignedUrl,
  downloadPrivateFileToMemory,
  duplicateAttachment,
};

module.exports = Bucket;
