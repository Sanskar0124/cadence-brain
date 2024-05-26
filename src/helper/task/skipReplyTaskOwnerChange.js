// Utils
const logger = require('../../utils/winston');
const {
  CADENCE_LEAD_STATUS,
  WORKFLOW_TRIGGERS,
  ACTIVITY_TYPE,
  WORKFLOW_ACTIONS,
  NODE_TYPES,
  TASK_STATUSES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const Repository = require('../../repository');

// Services and Helpers
const createTasksForLeads = require('./createTasksForLeads');
const ActivityHelper = require('../activity');
const fetchWorkflow = require('../workflow/fetchWorkflow');
const applyWorkflow = require('../workflow/applyWorkflow');

/**
 * @param {Integer} lead_id - lead_id
 */
const skipReplyTaskOwnerChange = async ({ lead, newOwner, oldOwner }) => {
  try {
    const [workflow, errForWorkflow] = await fetchWorkflow({
      trigger: WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES,
      company_id: lead.company_id,
    });
    if (errForWorkflow) return [null, errForWorkflow];
    if (!workflow) {
      logger.info(`No workflow found.`);
      return [null, `No workflow found.`];
    }

    const actions = Object.keys(workflow?.actions || {});
    if (!actions?.length) return [`No actions set for trigger.`, null];

    for (let action of actions) {
      const data = workflow?.actions[action];

      if (action === WORKFLOW_ACTIONS.CONTINUE_CADENCE) {
        const [leadToCadences, errForLeadToCadences] =
          await Repository.fetchAll({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: lead.lead_id,
            },
            include: {
              [DB_TABLES.CADENCE]: { attributes: ['type', 'cadence_id'] },
            },
            extras: {
              attributes: ['lead_id', 'cadence_id'],
            },
          });
        if (errForLeadToCadences) return [null, errForFetchedLead];
        for (let leadToCadence of leadToCadences) {
          let cadence = leadToCadence?.Cadences?.[0];

          // * Check if current task is reply task, then skip the task and create next task
          // * because the previously sent mail belongs to some other user

          const [currentTask, errForCurrentTask] = await Repository.fetchOne({
            tableName: DB_TABLES.TASK,
            query: {
              lead_id: lead.lead_id,
              cadence_id: cadence.cadence_id,
              completed: false,
              is_skipped: false,
            },
            include: {
              [DB_TABLES.NODE]: {
                required: true,
              },
            },
          });
          if (errForCurrentTask)
            logger.error(
              `Error while fetching current task: `,
              errForCurrentTask
            );

          if (
            [NODE_TYPES.AUTOMATED_REPLY_TO, NODE_TYPES.REPLY_TO].includes(
              currentTask.Node.type
            )
          ) {
            // * Skip task

            const [skipTaskUpdate, errForSkipTask] = await Repository.update({
              tableName: DB_TABLES.TASK,
              query: {
                task_id: currentTask.task_id,
              },
              updateObject: {
                is_skipped: true,
                skip_time: new Date().getTime(),
                status: TASK_STATUSES.SKIPPED,
                skip_reason: null,
              },
            });
            const [nextNode, errForNextNode] = await Repository.fetchOne({
              tableName: DB_TABLES.NODE,
              query: { node_id: currentTask.Node.next_node_id },
            });
            if (errForNextNode)
              logger.error(`Error while fetching next node: `, errForNextNode);
            if (nextNode) {
              // * Fetch lead to generate next currentTask for
              let [lead, errFetchingLead] = await Repository.fetchOne({
                tableName: DB_TABLES.LEAD,
                query: { lead_id: currentTask.lead_id },
              });
              if (errFetchingLead)
                logger.error(
                  `Error while fetching lead for next task: `,
                  errFetchingLead
                );

              const [taskCreated, errForTaskCreated] =
                await createTasksForLeads({
                  leads: [lead],
                  node: nextNode,
                  cadence_id: currentTask.cadence_id,
                  firstTask: false,
                });
              if (errForTaskCreated) return [null, errForTaskCreated];

              if (!nextNode.wait_time && taskCreated) {
                logger.info(`Created task.`);
              }
            } else {
              await Repository.update({
                tableName: DB_TABLES.LEADTOCADENCE,
                query: {
                  lead_id: currentTask.lead_id,
                  cadence_id: currentTask.cadence_id,
                },
                updateObject: { status: CADENCE_LEAD_STATUS.COMPLETED },
              });

              const [currentCadence, errForCurrentCadence] =
                await Repository.fetchOne({
                  tableName: DB_TABLES.CADENCE,
                  query: { cadence_id: currentTask.cadence_id },
                });

              // * Fetch and create activity
              const [activityFromTemplate, errForActivityFromTemplate] =
                ActivityHelper.getActivityFromTemplates({
                  type: ACTIVITY_TYPE.COMPLETED_CADENCE,
                  variables: {
                    cadence_name: currentCadence?.name,
                  },
                  activity: {
                    lead_id: currentTask.lead_id,
                    incoming: null,
                    node_id: currentTask.node_id,
                  },
                });

              let [createdActivity, _] = await ActivityHelper.activityCreation(
                activityFromTemplate,
                currentTask.user_id
              );
              if (createdActivity) logger.info('Created activity');

              applyWorkflow({
                trigger: WORKFLOW_TRIGGERS.WHEN_A_CADENCE_ENDS,
                lead_id: currentTask.lead_id,
                cadence_id: currentTask.cadence_id,
              });
              logger.info(`Handled cadence end.`);
            }
          }
        }
      }
    }

    return [true, null];
  } catch (err) {
    logger.error(`Error while skipping task: `, err);
    return [null, err.message];
  }
};

module.exports = skipReplyTaskOwnerChange;
