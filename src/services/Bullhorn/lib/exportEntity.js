// Packages
const logger = require('../../../utils/winston');
const axios = require('axios');

const exportEntity = async ({
  access_token,
  instance_url,
  object,
  body,
}) => {
  try {
    // Export Entity
    const bullhornObject = object[0].toUpperCase() + object.substring(1);

    let URL = `${instance_url}/entity/${bullhornObject}`;
    const { data } = await axios.put(
      URL,
      body,
      {
        headers: {
          BhRestToken: `${access_token}`,
        },
      }
    );
    return [data, null];
  } catch (err) {
    logger.error(
      `Error while exporting ${object} in bullhorn: ${err.message}`
    );
    return [null, err.message];
  }
};

module.exports = {
  exportEntity,
};
