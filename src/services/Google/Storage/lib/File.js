const { Storage } = require('@google-cloud/storage');
const CONSTANTS = require('./constants');
const {
  _getFileName,
  _getThumbnailName,
  _getVideoFileName,
} = require('./_getFileName');

const storage = new Storage();

const url = (user_id) => {
  const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
  const file = bucket.file(_getFileName(user_id));
  return file.publicUrl();
};

const thumnailUrl = (thumbnail_name) => {
  const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
  const file = bucket.file(_getThumbnailName(thumbnail_name));
  return file.publicUrl();
};

const videoUrl = (video_name) => {
  const bucket = storage.bucket(CONSTANTS.BUCKET_NAME);
  const file = bucket.file(_getVideoFileName(video_name));
  return file.publicUrl();
};

const File = { url, thumnailUrl, videoUrl };

module.exports = File;
