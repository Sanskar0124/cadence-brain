// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  CADENCE_LEAD_STATUS,
  CADENCE_STATUS,
  CADENCE_TYPES,
  ACTIVITY_TYPE,
  LEAD_STATUS,
} = require('../../utils/enums');
const { LEAD_CADENCE_ORDER_MAX } = require('../../utils/constants');

// Packages
const { Op } = require('sequelize');

// Repository
const Repository = require('../../repository');
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');
const createTasksForLeads = require('../task/createTasksForLeads');
const recalculateDailyTasksForUsers = require('../task/recalculateDailyTasksForUsers');

// Helper
const hasLeadUnsubscribed = require('../lead/hasLeadUnsubscribed');
const ActivityHelper = require('../activity');

const addLeadToCadence = async ({ lead_id, cadence_id, launchingUser }) => {
  try {
    // fetch lead
    const [lead, errForLead] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: {
        lead_id,
      },
      include: {
        [DB_TABLES.USER]: {
          required: true,
        },
      },
    });
    if (errForLead) return [null, errForLead];
    if (!lead) return [null, 'No lead found with the given lead_id.'];

    const user = lead.User;

    // fetch cadence
    const [cadence, errForCadence] = await Repository.fetchOne({
      tableName: DB_TABLES.CADENCE,
      query: { cadence_id },
    });
    if (errForCadence) return [null, errForCadence];
    if (!cadence) return [null, 'No cadence found with the given cadence_id.'];

    // Check if the user has access to the cadence
    if (
      (cadence.type === CADENCE_TYPES.PERSONAL &&
        cadence.user_id !== user.user_id) ||
      (cadence.type === CADENCE_TYPES.TEAM && cadence.sd_id !== user.sd_id) ||
      (cadence.type === CADENCE_TYPES.COMPANY &&
        cadence.company_id !== user.company_id)
    )
      return [null, 'User not part of the cadence.'];

    const [link, errForGetLink] =
      await LeadToCadenceRepository.getLeadToCadenceLinksByLeadQuery({
        lead_id,
        cadence_id,
      });
    if (errForGetLink) return [null, errForGetLink];

    // Link does not exist
    if (link.length === 0) {
      logger.info(`Link does not exist`);
      const [unsubscribed] = await hasLeadUnsubscribed(lead_id);

      let lead_cadence_order = 0;

      // * fetch last lead number for user in cadence
      let [lastLeadToCadenceForUserInCadence] =
        await LeadToCadenceRepository.getLastLeadToCadenceByLeadQuery(
          {
            cadence_id,
            lead_cadence_order: {
              [Op.lt]: LEAD_CADENCE_ORDER_MAX,
            },
          }, // * lead_cadence_query
          { user_id: user.user_id } // * lead_query
        );

      lastLeadToCadenceForUserInCadence =
        lastLeadToCadenceForUserInCadence?.[0];

      // * If last link exists, use its leadCadenceOrder
      if (lastLeadToCadenceForUserInCadence)
        lead_cadence_order =
          (lastLeadToCadenceForUserInCadence?.lead_cadence_order || 0) + 1;
      // * If it does not exists, initialiaze it to 1
      else lead_cadence_order = 1;

      let leadToCadenceStatus = '';

      switch (cadence.status) {
        case CADENCE_STATUS.IN_PROGRESS:
          leadToCadenceStatus = CADENCE_LEAD_STATUS.IN_PROGRESS;
          break;

        case CADENCE_STATUS.NOT_STARTED:
        case CADENCE_STATUS.PAUSED:
          leadToCadenceStatus = CADENCE_LEAD_STATUS.NOT_STARTED;
          break;

        default:
          break;
      }

      const [createdLink, errForCreatedLink] =
        await LeadToCadenceRepository.createLeadToCadenceLink({
          lead_id,
          cadence_id,
          status:
            lead.status === LEAD_STATUS.CONVERTED ||
            lead.status === LEAD_STATUS.TRASH
              ? CADENCE_LEAD_STATUS.STOPPED
              : cadence.status === CADENCE_STATUS.IN_PROGRESS
              ? CADENCE_LEAD_STATUS.IN_PROGRESS
              : CADENCE_STATUS.NOT_STARTED,
          unsubscribed: unsubscribed ?? false,
          lead_cadence_order,
        });
      if (errForCreatedLink) return [null, errForCreatedLink];

      if (cadence.status === CADENCE_STATUS.IN_PROGRESS) {
        const [tasks, errForTask] = await Repository.fetchAll({
          tableName: DB_TABLES.TASK,
          query: {
            lead_id,
            cadence_id,
          },
        });

        if (!errForTask && tasks.length === 0) {
          const [node, errForNode] = await Repository.fetchOne({
            tableName: DB_TABLES.NODE,
            query: {
              cadence_id,
              is_first: 1,
            },
          });

          if (!errForNode && node) {
            const [taskCreated] = await createTasksForLeads({
              leads: [lead],
              node,
              cadence_id: cadence.cadence_id,
              firstTask: true,
            });
            if (taskCreated) {
              const unixTime = Math.round(new Date().getTime() / 1000);
              const [activityFromTemplate, errForActivityFromTemplate] =
                ActivityHelper.getActivityFromTemplates({
                  type: ACTIVITY_TYPE.LAUNCH_CADENCE,
                  variables: {
                    cadence_name: cadence.name,
                    first_name: launchingUser.first_name,
                    last_name: launchingUser.last_name,
                    launch_at: unixTime,
                  },
                  activity: {
                    cadence_id,
                    lead_id,
                    user_id: lead.user_id,
                    incoming: null,
                  },
                });
              ActivityHelper.activityCreation(
                activityFromTemplate,
                lead.user_id
              );

              recalculateDailyTasksForUsers([lead.user_id]);
            }
          }
        }
      }

      return [createdLink, null];
    } else {
      // Link already exists
      logger.info(`Link already exists`);
      return [null, 'Link already exists.'];
    }
  } catch (err) {
    logger.error('Error while adding lead to cadence: ', err);
    return [null, err.message];
  }
};

module.exports = addLeadToCadence;
