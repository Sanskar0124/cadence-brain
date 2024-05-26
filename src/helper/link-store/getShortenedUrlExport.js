// Utils
const logger = require('../../utils/winston');

// Repositories
const LinkStoreRepository = require('../../repository/link-store.repository');

const getShortenedUrlExport = async (redirectUrl, linkText = 'LINK') => {
  try {
    var url = Math.floor(Math.random() * 100000).toString(16);
    var recordObj = {
      redirect_url: redirectUrl,
      url: url,
      link_text: linkText,
    };
    var [url, err] = await LinkStoreRepository.createShortenedLink(recordObj);
    if (err) return [null, 1];
    return [url, 0];
  } catch (error) {
    logger.error('Error while getting shortened URL export: ', err);
    return [null, 1];
  }
};

module.exports = getShortenedUrlExport;
