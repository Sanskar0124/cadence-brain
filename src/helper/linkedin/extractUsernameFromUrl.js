const extractUsernameFromUrl = (linkedin_url = '') => {
  if (!linkedin_url) return [null, 'Linkedin url is required.'];

  if (linkedin_url.endsWith('/')) {
    linkedin_url = linkedin_url.substring(0, linkedin_url.length - 1);
  }

  let username = '';

  username = linkedin_url.match(/\/in\/.*/g)?.[0];
  if (!username) return [null, 'Invalid Linkedin url.'];
  username = username.substring(4);

  return [username, null];
};

module.exports = extractUsernameFromUrl;
