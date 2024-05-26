// Utils
const logger = require('../../utils/winston');
const { DEV_AUTH, SUPPORT_BACKEND_URL } = require('../../utils/config');

// Packages
const axios = require('axios');

const createActivityHook = async ({ name, type, status, comment }) => {
  try {
    const data = {
      name: name,
      type: type,
      status: status,
      comment: comment,
    };

    let config = {
      method: 'post',
      url: `${SUPPORT_BACKEND_URL}/v1/webhook/cadence/createActivity`,
      headers: {
        Authorization: `Bearer ${DEV_AUTH}`,
        'Content-Type': 'application/json',
      },
      data: data,
    };

    let response = await axios(config);
    return [true, null];
  } catch (err) {
    logger.error('Error while sending company webhook:', err);
    return [null, err.message];
  }
};

module.exports = createActivityHook;
