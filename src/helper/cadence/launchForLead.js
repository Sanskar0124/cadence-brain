// Utils
const logger = require('../../utils/winston');
const { ACTIVITY_TYPE } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const NodeRepository = require('../../repository/node.repository');
const CadenceRepository = require('../../repository/cadence.repository');
const Repository = require('../../repository');

// Helpers and services
const createTasksForLeads = require('../task/createTasksForLeads');
const ActivityHelper = require('../activity');

const launchCadenceForLead = async (
  lead,
  cadence_id,
  node,
  user_id,
  firstTask = false
) => {
  try {
    // * fetch first node in cadence
    let firstNode = node,
      errForFirstNode;
    if (!node) {
      [firstNode, errForFirstNode] = await NodeRepository.getNode({
        cadence_id,
        is_first: 1,
      });
    }
    if (errForFirstNode) return [null, errForFirstNode];

    let user, errForUser;

    if (user_id) {
      [user, errForUser] = await Repository.fetchOne({
        tableName: DB_TABLES.USER,
        query: { user_id },
      });
      if (errForUser) return [null, errForUser];
    }

    //get Cadence
    const [cadence, errForCadence] = await CadenceRepository.getCadence({
      cadence_id,
    });
    if (errForCadence) return [null, errForCadence];

    const unixTime = Math.round(new Date().getTime() / 1000);

    const [activityFromTemplate, errForActivityFromTemplate] =
      ActivityHelper.getActivityFromTemplates({
        type: ACTIVITY_TYPE.LAUNCH_CADENCE,
        variables: user
          ? {
              cadence_name: cadence.name,
              first_name: user.first_name,
              last_name: user.last_name,
              launch_at: unixTime,
            }
          : {
              cadence_name: cadence.name,
            },
        activity: {
          cadence_id: cadence_id,
          lead_id: lead?.lead_id,
          user_id: lead.user_id,
        },
      });

    const [sendingActivity, errForSendingActivity] =
      await ActivityHelper.activityCreation(activityFromTemplate, lead.user_id);

    const [createdTask, errForCreatedTask] = await createTasksForLeads({
      leads: [lead],
      node: firstNode,
      cadence_id,
      firstTask,
    });

    return [createdTask, errForCreatedTask];
  } catch (err) {
    logger.error(`Error while launching cadence for lead: `, err);
    return [null, err.message];
  }
};

module.exports = launchCadenceForLead;
