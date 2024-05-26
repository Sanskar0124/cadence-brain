//Utils
const logger = require('../../utils/winston');

function convertLinkedInURL(url) {
  try {
    const pattern =
      /^https:\/\/www.linkedin.com\/sales\/lead\/(.+),NAME_SEARCH,.+$/;
    const match = url.match(pattern);
    if (match) {
      const id = match[1];
      return [`https://linkedin.com/in/${id}`, null];
    }
    return [url, null];
  } catch (err) {
    logger.error('Error while converting Linkedin Url:', err);
    return [null, err.message];
  }
}

module.exports = convertLinkedInURL;
