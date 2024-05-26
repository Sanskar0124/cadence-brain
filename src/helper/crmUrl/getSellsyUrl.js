const logger = require('../../utils/winston');
const getSellsyUrl = (lead) => {
  try {
    let sellsyUrl = 'https://www.sellsy.com/peoples';
    if (lead.integration_id) sellsyUrl += `/${lead.integration_id}`;
    else sellsyUrl = '';

    return [sellsyUrl, null];
  } catch (err) {
    logger.error('An error occurred while making sellsy URL:', err);
    return [null, err];
  }
};

module.exports = getSellsyUrl;
