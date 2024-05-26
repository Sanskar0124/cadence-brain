// Utils
const logger = require('../../utils/winston');
const { LEAD_STATUS } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Repositories
const LeadRepository = require('../../repository/lead.repository');

const getMonitoringForUser = async (users, dateRange) => {
  try {
    const result = [];
    for (let user of users) {
      user = JSON.parse(JSON.stringify(user));

      // * get in queue i.e. new_leads(not yet contacted)
      const [inQueueCount, errForInQueueCount] =
        await LeadRepository.getCountForInQueue({
          status: LEAD_STATUS.NEW_LEAD,
          user_id: user.user_id,
          [Op.or]: [
            {
              '$Tasks.task_id$': null,
            },
            {
              '$Tasks.completed$': 0,
            },
          ],
        });

      // * get in progress i.e. ongoing(contacted)
      const [inProgressCount, errForInProgressCount] =
        await LeadRepository.getCountForInProgress({
          status: {
            [Op.in]: [LEAD_STATUS.ONGOING, LEAD_STATUS.PAUSED],
          },
          user_id: user.user_id,
        });

      user.monitoring = {
        in_queue: inQueueCount || 0,
        in_progress: inProgressCount || 0,
      };

      delete user.Leads;

      result.push(user);
    }

    return [result, null];
  } catch (err) {
    logger.error(`Error while fetching monitoring for user: ${err.message}.`);
    return [null, err.message];
  }
};

module.exports = getMonitoringForUser;
