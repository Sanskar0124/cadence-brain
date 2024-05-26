const logger = require('../../utils/winston');

// * Helper and services imports
const LinkedinService = require('../../services/Linkedin');
const removeLinkedInCookie = require('./removeLinkedInCookie');

const viewProfile = async ({ linkedin_url, linkedin_cookie, user_id }) => {
  try {
    if (!linkedin_url || !linkedin_cookie)
      return [null, 'Linkedin url and cookie are required.'];

    // get headers
    const [headers, errForHeaders] = await LinkedinService.fetchHeaders(
      linkedin_cookie
    );
    if (errForHeaders) return [null, errForHeaders];

    // fetch profile data
    const [profileViewed, errForProfileViewed] =
      await LinkedinService.viewLinkedinProfile({
        linkedin_url,
        headers,
      });
    if (
      errForProfileViewed === 'Maximum number of redirects exceeded' ||
      errForProfileViewed === 'Request failed with status code 999'
    ) {
      // * Logout user
      removeLinkedInCookie({ user_id });
      return [
        null,
        'Your session cookie has expired. Please update the session cookie in your profile page.',
      ];
    }
    if (!profileViewed) return [null, 'Failed to view LinkedIn profile'];

    return [true, null];
  } catch (err) {
    logger.error('Error in Linkedin view profile helper: ', err);
    return [null, err.message];
  }
};

module.exports = viewProfile;
