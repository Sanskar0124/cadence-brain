const logger = require('../../utils/winston');
const getPipedriveUrl = (instance_url, lead) => {
  try {
    let pipedriveUrl = instance_url;
    if (lead.integration_id) pipedriveUrl += `/person/${lead.integration_id}`;
    else pipedriveUrl = '';
    return [pipedriveUrl, null];
  } catch (err) {
    logger.error('An error occurred while making pipedrive URL:', err);
    return [null, err];
  }
};

module.exports = getPipedriveUrl;
