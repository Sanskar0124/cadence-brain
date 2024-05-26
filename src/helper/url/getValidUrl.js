const isValidUrl = require('./isValidUrl');

const getValidUrl = (url) => {
  if (!url) return [null, 'URL is required.'];

  try {
    const urlObj = new URL(url);
    return [url, null];
  } catch (err) {
    let validUrl = '';
    if (url.startsWith('www') || !url.startsWith('http'))
      validUrl = `https://${url}`;
    if (!isValidUrl(validUrl)[0]) return [null, 'Invalid url string.'];
    return [validUrl, null];
  }
};

module.exports = getValidUrl;
