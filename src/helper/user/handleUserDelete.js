// Utils
const { USER_DELETE_OPTIONS, LEAD_STATUS } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Repositories
const EmailRepository = require('../../repository/email.repository');
const TaskRepository = require('../../repository/task.repository');
const StatusRepository = require('../../repository/status.repository');
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');
const ActivityRepository = require('../../repository/activity.repository');
const NoteRepository = require('../../repository/note.repository');
const LeadRepository = require('../../repository/lead.repository');

const handleUserDelete = async (leadIds, user_id, reassignTo, option) => {
  try {
    /**
     * * To delete all leads - delete all leads,tasks,leadToCadences,status etc.
     * * To re-assign all leads -  chnage user id from all leads, tasks,leadToCadences,status, etc.
     * * To un-assign all leads - delete user id from all leads, and delete all related tasks,leadToCadences,status
     */

    // * No leads for user, so no additional tasks needs to be done
    if (leadIds.length === 0) return ['Successfully deleted user', null];

    // * make array with lead ids
    leadIds = leadIds.map((leadId) => leadId?.lead_id);

    if (option === USER_DELETE_OPTIONS.UNASSIGN) {
      // * update leads of the user and delete user_id
      await LeadRepository.updateLeads(
        {
          user_id: user_id,
        },
        {
          user_id: null,
          status: LEAD_STATUS.UNASSIGNED,
        }
      );

      // * delete all emails
      await EmailRepository.deleteEmailsByQuery({
        lead_id: {
          [Op.in]: leadIds,
        },
      });

      // * delete all tasks
      await TaskRepository.deleteTasksByQuery({
        user_id: user_id,
      });

      // * delete all status
      await StatusRepository.deleteStatusByQuery({
        lead_id: {
          [Op.in]: leadIds,
        },
      });
      // * delete all LeadtoCadences
      // await LeadToCadenceRepository.deleteLeadToCadenceLink({
      //   lead_id: {
      //     [Op.in]: leadIds,
      //   },
      // });
    } else if (option === USER_DELETE_OPTIONS.REASSIGN) {
      // * re-assign to other user
      await LeadRepository.updateLeads(
        {
          lead_id: {
            [Op.in]: leadIds,
          },
        },
        {
          user_id: reassignTo,
        }
      );

      // * update all tasks
      await TaskRepository.updateTask(
        {
          user_id: user_id,
        },
        {
          user_id: reassignTo,
        }
      );
    } else if (option === USER_DELETE_OPTIONS.DELETE_ALL) {
      await LeadRepository.deleteLeadsByQuery({
        lead_id: {
          [Op.in]: leadIds,
        },
      });

      // * delete all activities
      await ActivityRepository.deleteActivity({
        lead_id: {
          [Op.in]: leadIds,
        },
      });

      // * delete all emails
      await EmailRepository.deleteEmailsByQuery({
        lead_id: {
          [Op.in]: leadIds,
        },
      });

      // * delete all notes
      await NoteRepository.deleteNote({
        lead_id: {
          [Op.in]: leadIds,
        },
      });

      // * delete all tasks
      await TaskRepository.deleteTasksByQuery({
        lead_id: {
          [Op.in]: leadIds,
        },
      });

      // * delete all status
      await StatusRepository.deleteStatusByQuery({
        lead_id: {
          [Op.in]: leadIds,
        },
      });

      // * delete all LeadtoCadences
      await LeadToCadenceRepository.deleteLeadToCadenceLink({
        lead_id: {
          [Op.in]: leadIds,
        },
      });
    }

    return ['Successfully deleted user', null];
  } catch (err) {
    logger.error(`Error while handling delete user: `, err);
    return [null, err.message];
  }
};

module.exports = handleUserDelete;
