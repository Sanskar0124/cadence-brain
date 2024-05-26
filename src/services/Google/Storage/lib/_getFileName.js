const _getFileName = (user_id) => {
  return `crm/profile-images/${user_id}`;
};

const _getSubDepartmentImageName = (sd_id) => {
  return `crm/sub-department-images/${sd_id}`;
};
const _getImageName = (fileName) => {
  return `crm/mail-images/${fileName}`;
};

const _getVideoFileName = (gcp_video_name) => {
  return `crm/videos/${gcp_video_name}`;
};

const _getThumbnailName = (thumbnail_name) => {
  return `crm/thumbnails/${thumbnail_name}`;
};

const _getAttachmentFileName = (attachment_id, original_name) => {
  return `crm/attachments/${attachment_id}/${original_name}`;
};

const _getAttachmentFolderName = (attachment_id) => {
  return `crm/attachments/${attachment_id}`;
};

module.exports = {
  _getFileName,
  _getSubDepartmentImageName,
  _getVideoFileName,
  _getThumbnailName,
  _getImageName,
  _getAttachmentFileName,
  _getAttachmentFolderName,
};
