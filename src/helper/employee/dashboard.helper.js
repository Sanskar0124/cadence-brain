// Utils
const logger = require('../../utils/winston');
const { LEAD_STATUS } = require('../../utils/enums');

// Repositories
const LeadRepository = require('../../repository/lead.repository');

const getMetricsForUser = async (user_id, filter, timezone) => {
  try {
    let countObject = {};
    [countObject.newLeadsCount, err] =
      await LeadRepository.getLeadCountByStatus(
        user_id,
        timezone,
        LEAD_STATUS.NEW_LEAD,
        filter
      );
    [countObject.ongoingCount, err2] =
      await LeadRepository.getLeadCountByStatus(
        user_id,
        timezone,
        LEAD_STATUS.ONGOING,
        filter
      );
    [countObject.convertedCount, err3] =
      await LeadRepository.getLeadCountByStatus(
        user_id,
        timezone,
        LEAD_STATUS.CONVERTED,
        filter
      );
    return [countObject, null];
  } catch (e) {
    logger.error('Error in getMetricsForUser: ', e);
    return [null, e];
  }
};

module.exports = {
  getMetricsForUser,
};
