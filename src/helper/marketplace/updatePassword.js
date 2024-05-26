// Utils
const logger = require('../../utils/winston');
const { MARKETPLACE_URL, DEV_AUTH } = require('../../utils/config');

// Packages
const axios = require('axios');

const updatePassword = async (user_id, password) => {
  try {
    const res = await axios.put(
      `${MARKETPLACE_URL}/v1/super-admin/password`,
      {
        user_id,
        password,
      },
      {
        headers: {
          Authorization: `Bearer ${DEV_AUTH}`,
        },
      }
    );
    logger.info(
      `Password updated in marketplace: ` + JSON.stringify(res.data, null, 4)
    );

    return [`Password updated`, null];
  } catch (err) {
    logger.error(`Error while updating password: `, err);
    return [null, err.message];
  }
};

module.exports = updatePassword;
