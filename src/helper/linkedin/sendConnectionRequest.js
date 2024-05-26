const logger = require('../../utils/winston');

// * Helper and services imports
const VariablesHelper = require('../variables');
const LinkedinService = require('../../services/Linkedin');
const removeLinkedInCookie = require('./removeLinkedInCookie');

const sendConnectionRequest = async ({
  linkedin_url,
  linkedin_cookie,
  message,
  lead_id = null,
}) => {
  try {
    if (!linkedin_url || !linkedin_cookie)
      return [null, 'Linkedin url and cookie are required.'];

    if (message && lead_id)
      [message] = await VariablesHelper.replaceVariablesForLead(
        message,
        lead_id
      );

    // get headers
    const [headers, errForHeaders] = await LinkedinService.fetchHeaders(
      linkedin_cookie
    );
    if (errForHeaders) return [null, errForHeaders];

    // fetch profile data
    const [profile, errForProfile] = await LinkedinService.fetchProfileData(
      linkedin_url,
      headers
    );
    if (
      errForProfile === 'Maximum number of redirects exceeded' ||
      errForProfile === 'Request failed with status code 999'
    ) {
      // * Logout user
      removeLinkedInCookie({ user_id });
      return [
        null,
        'Your session cookie has expired. Please update the session cookie in your profile page.',
      ];
    }
    if (!profile) return [null, 'Failed to fetch linkedin profile data.'];

    const profileId = String(
      profile?.profile?.miniProfile?.entityUrn?.split(':')[3]
    );

    // send connection request
    const [success, errForSuccess] =
      await LinkedinService.sendConnectionRequest({
        headers,
        message,
        profileId,
      });
    if (errForSuccess) return [null, errForSuccess];
    if (!success) return [null, 'Failed to send connection request'];

    return [true, null];
  } catch (err) {
    logger.error('Error in Linkedin sendConnectionRequest helper: ', err);
    return [null, err.message];
  }
};

module.exports = sendConnectionRequest;
