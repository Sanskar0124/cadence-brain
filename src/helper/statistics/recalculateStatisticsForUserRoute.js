// Utils
const logger = require('../../utils/winston');
const { STATISTICS_SERVICE_URL } = require('../../utils/config');

// Packages
const axios = require('axios');

const recalculateStatisticsForUserRoute = async ({ company_id, timezone }) => {
  try {
    if (!company_id && !timezone)
      return [null, `Expected company_id and timezone.`];

    const res = await axios.post(
      `${STATISTICS_SERVICE_URL}/v2/recalculate-user`,
      {
        company_id,
        timezone,
      }
    );
    logger.info(JSON.stringify(res.data, null, 4));
    return [`Sent request to statistics service.`, null];
  } catch (err) {
    logger.error(`Error while recalculating stats for user: `, err);
    return [null, err.message];
  }
};

module.exports = recalculateStatisticsForUserRoute;
