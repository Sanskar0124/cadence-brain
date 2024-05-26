// Utils
const logger = require('../../utils/winston');

const client = require('./setup');

const sendProfiles = async ({ profileData, user_id }) => {
  try {
    let data = await client.sendProfiles({
      user_id,
      profile_data: JSON.stringify(profileData),
    });

    if (data.success) return [data.msg, null];
    else return [null, data.msg];
  } catch (err) {
    logger.error('Error while profiles to socket service via grpc: ', err);
    return [null, err.message];
  }
};

module.exports = sendProfiles;
