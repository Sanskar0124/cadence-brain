// Utils
const logger = require('../../utils/winston');
const {
  CADENCE_STATUS,
  LEAD_STATUS,
  CADENCE_LEAD_STATUS,
} = require('../../utils/enums');

const checkIfTaskIsExecutable = (task) => {
  try {
    if (!task?.Cadence?.status) return [null, `Cadence status not found.`];
    else if (task.Cadence.status !== CADENCE_STATUS.IN_PROGRESS)
      return [null, `Cadence not in progress.`];

    if (!task?.Lead?.status) return [null, `Lead status not found`];
    else if (
      ![LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING].includes(task.Lead.status)
    )
      return [null, `Lead status : ${task.Lead.status}.`];

    if (!task?.Lead?.LeadToCadences?.[0]?.status)
      return [null, `Lead to cadence status not found.`];
    else if (
      task.Lead.LeadToCadences[0].status !== CADENCE_LEAD_STATUS.IN_PROGRESS
    )
      return [null, `Lead to cadence status not in progress.`];

    // * All checks passed, it is executable
    return [true, null];
  } catch (err) {
    logger.error(`Error while checking if task is executable: ${err.message}.`);
    return [null, err.message];
  }
};

module.exports = checkIfTaskIsExecutable;
