// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

// Helpers
const generateTrackingId = require('../../../helper/linkedin/generateTrackingId');

const sendConnectionRequest = async ({ headers, message, profileId }) => {
  try {
    // convert message to Buffer
    message = Buffer.from(message, 'utf-8');

    const URL = 'https://www.linkedin.com/voyager/api/growth/normInvitations';

    const params = {
      trackingId: generateTrackingId(),
      message: String(message.toString('utf-8')),
      invitations: [],
      excludeInvitations: [],
      invitee: {
        'com.linkedin.voyager.growth.invitation.InviteeProfile': {
          profileId: profileId,
        },
      },
    };

    const res = await axios.post(URL, params, { headers });
    const success = res.status === 201;

    return [success, null];
  } catch (err) {
    logger.error('Error while sending linkedin connection request: ', err);
    return [null, err.message];
  }
};

module.exports = sendConnectionRequest;
