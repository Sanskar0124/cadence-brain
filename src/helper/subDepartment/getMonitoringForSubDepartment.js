// Utils
const logger = require('../../utils/winston');
const { LEAD_STATUS, USER_ROLE } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Repositories
const LeadRepository = require('../../repository/lead.repository');

const getMonitoringForSubDepartment = async (subDepartments) => {
  try {
    const result = [];
    for (let subDepartment of subDepartments) {
      const { sd_id } = subDepartment;

      // * get in queue i.e. new_leads(not yet contacted)
      const inQueuePromise = LeadRepository.getCountForInQueue(
        {
          // * lead query
          status: LEAD_STATUS.NEW_LEAD,
          // user_id: user.user_id,
          [Op.or]: [
            {
              '$Tasks.task_id$': null,
            },
            {
              '$Tasks.completed$': 0,
            },
          ],
        },
        {
          // * user query
          sd_id,
          role: {
            [Op.in]: [USER_ROLE.SALES_PERSON, USER_ROLE.SALES_MANAGER_PERSON], // only for salesPersons
          },
        }
      );

      // * get in progress i.e. ongoing(contacted)
      const inProgressPromise = LeadRepository.getCountForInProgress(
        {
          status: {
            [Op.in]: [LEAD_STATUS.ONGOING, LEAD_STATUS.PAUSED],
          },
          //   user_id: user.user_id,
        },
        {
          sd_id,
          role: {
            [Op.in]: [USER_ROLE.SALES_PERSON, USER_ROLE.SALES_MANAGER_PERSON], // only for salesPersons
          },
        }
      );

      let [
        [inQueueCount, errForInQueueCount],
        [inProgressCount, errForInProgressCount],
      ] = await Promise.all([inQueuePromise, inProgressPromise]);

      subDepartment.monitoring = {
        in_queue: inQueueCount || 0,
        in_progress: inProgressCount || 0,
      };
      // console.log(subDepartment);

      result.push(subDepartment);
    }

    return [result, null];
  } catch (err) {
    logger.error(
      `Error while fetching monitoring for sub-department: ${err.message}.`
    );
    return [null, err.message];
  }
};

// getMonitoringForSubDepartment([
//   { sd_id: 'ed3c53e7-e51a-4767-bf8d-91d282f14189' },
// ]);

module.exports = getMonitoringForSubDepartment;
