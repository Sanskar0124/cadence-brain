// Utils
const logger = require('../../utils/winston');
const {
  LEAD_STATUS,
  NODE_TYPES,
  CADENCE_LEAD_STATUS,
  TAG_NAME,
  SETTING_TYPES,
  ACTIVITY_TYPE,
  WORKFLOW_TRIGGERS,
  TASK_NAMES_BY_TYPE,
  EMAIL_STATUS,
  TASK_STATUSES,
  LEAD_INTEGRATION_TYPES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  URGENT_TIME_DIFF_FOR_INBOUND,
  URGENT_TIME_DIFF_FOR_OUTBOUND,
} = require('../../utils/constants');

// Packages
const { Sequelize } = require('sequelize');

// Db
const { sequelize } = require('../../db/models');

// Repositories
const TaskRepository = require('../../repository/task.repository');
const UserRepository = require('../../repository/user-repository');
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');
const NodeRepository = require('../../repository/node.repository');
const TagRepository = require('../../repository/tag.repository');
const Repository = require('../../repository');

// Helpers and services
const getStartTimeForTask = require('./getStartTimeForTask');
const getSettingsForUser = require('../user/getSettingsForUser');
const ActivityHelper = require('../activity');

/**
 * @param {Array} leads - leads for which tasks needs to be made
 * @param {Object} node - node for which tasks needs to be made
 * @param {Sequelize.INTEGER} cadence_id - cadence for which tasks are needed to be made
 * @param {bool} firstTask - Whether the task is first task or not. If it is first, start time will be curr time and if not it needs to be calculated
 * @param {Array} dependencies - dependency injections for certain modules that can cause circular imports, if dependency is injected we use the injected function else we lazy load the module
 */

const createTasksForLeads = async ({
  leads,
  node,
  cadence_id,
  firstTask = true,
  dependencies,
}) => {
  try {
    logger.info(
      `Creating tasks for ${leads.length} leads in cadence: ${cadence_id}.`
    );

    let createdTasks = []; // contains created tasks

    let delayForUrgent = 0; // * delay which will be added to start time to get urgent_time
    let emailSetting = {};
    let late_time = new Date().getTime();

    // * If cadence_id exists
    if (cadence_id) {
      // * Check for its tags
      const [tags, errForTags] = await TagRepository.getTags({
        cadence_id,
      });

      if (errForTags)
        return [null, `Error while fetching tags for cadence: ${errForTags}`];

      /**
       * * If tags exist, then take first tag, and check if it is tag of inbound or outbound
       * * And set delayForUrgent accordingly
       * * If any other tag's present then do nothing
       */
      if (tags?.length) {
        let requiredTag = tags[0];
        if (requiredTag?.tag_name === TAG_NAME.INBOUND)
          delayForUrgent = URGENT_TIME_DIFF_FOR_INBOUND * 60 * 60 * 1000;
        else if (requiredTag?.tag_name === TAG_NAME.OUTBOUND)
          delayForUrgent = URGENT_TIME_DIFF_FOR_OUTBOUND * 60 * 60 * 1000;
      }
    } else return [null, `Cadence id required.`];

    /**
     * * Fetch email settings for company that user belongs to.
     * * Since all leads for a cadence will always belong to same company, take user_id for any lead,
     * * find its company's email settings and use it.
     *
     */

    if (leads && leads.length) {
      // * find user to fetch company id
      const [requiredCompanyUser, errForRequiredCompanyUser] =
        await UserRepository.findUserByQuery({ user_id: leads[0].user_id });

      if (errForRequiredCompanyUser)
        return [
          null,
          `Error while fetching user by query: ${errForRequiredCompanyUser}`,
        ];

      if (!requiredCompanyUser) {
        logger.error(`No user found while fetching company email settings.`);
        return [null, 'No user found while fetching company email settings.'];
      }

      // * find email settings
    }

    let userAutomatedMailSettingsObject = {},
      userLateSettingObject = {};

    // * create task for each lead
    for (let lead of leads) {
      const [fetchedLead, errForFetchedLead] = await Repository.fetchOne({
        tableName: DB_TABLES.LEAD,
        query: { lead_id: lead.lead_id },
      });
      if (fetchedLead) lead = fetchedLead;
      else {
        logger.info(`No lead found.`);
        continue;
      }

      let automatedMailSettings,
        errForAutomatedMailSettings,
        taskSettings,
        errForTaskSettings,
        lead_integration_type = fetchedLead.integration_type;

      // only fetch all things if it is not a product tour lead
      if (
        lead_integration_type !== LEAD_INTEGRATION_TYPES.PRODUCT_TOUR_EXCEL_LEAD
      ) {
        if (userAutomatedMailSettingsObject[lead.user_id])
          automatedMailSettings = userAutomatedMailSettingsObject[lead.user_id];
        else {
          [automatedMailSettings, errForAutomatedMailSettings] =
            await getSettingsForUser({
              user_id: lead.user_id,
              setting_type: SETTING_TYPES.AUTOMATED_TASK_SETTINGS,
            });

          if (errForAutomatedMailSettings) {
            logger.error(
              `Error while fetching automated email settings for user.`,
              errForAutomatedMailSettings
            );
            continue;
          }

          if (!automatedMailSettings.Automated_Task_Setting) {
            logger.error(
              `No automated mail settings found for user: ${lead.user_id}.`
            );
            continue;
          }

          userAutomatedMailSettingsObject[lead.user_id] = automatedMailSettings;
        }

        if (userLateSettingObject[lead.user_id])
          taskSettings = userLateSettingObject[lead.user_id];
        else {
          [taskSettings, errForTaskSettings] = await getSettingsForUser({
            user_id: lead.user_id,
            setting_type: SETTING_TYPES.TASK_SETTINGS,
          });

          if (errForTaskSettings) {
            logger.error(
              `Error while fetching task settings for user.`,
              errForTaskSettings
            );
            continue;
          }

          if (!taskSettings.Task_Setting) {
            logger.error(`No task settings found for user: ${lead.user_id}.`);
            continue;
          }

          userLateSettingObject[lead.user_id] = taskSettings;
        }

        emailSetting = automatedMailSettings.Automated_Task_Setting;

        // set default for reply to
        if (taskSettings?.Task_Setting?.late_settings?.[NODE_TYPES.MAIL])
          taskSettings.Task_Setting.late_settings[NODE_TYPES.REPLY_TO] =
            taskSettings?.Task_Setting?.late_settings?.[NODE_TYPES.MAIL];
        if (!taskSettings.Task_Setting.late_settings?.[node.type])
          logger.error(`No late settings found for node type: ${node.type}`);

        // late time for node type
        late_time =
          taskSettings.Task_Setting.late_settings?.[node.type] || late_time;
      }

      const [cadenceLeads, errForCadenceLeads] =
        await LeadToCadenceRepository.getLeadToCadenceLinksByLeadQuery({
          lead_id: lead.lead_id,
          cadence_id,
        });

      let cadenceLead = cadenceLeads[0];

      /*
       * Note
       * commenting this extra checks before creating tasks due to some cases
       * where a workflow is applied which pauses the cadence and simultaneously we try to create tasks in this function
       * and since its status is paused, tasks are not created
       * when the cadence resumes again, no tasks are present to be shown/executed.
       *
       * we will create tasks for leads in any case
       * if lead_cadence_status/lead_status is not valid then the tasks will be ignored by task service
       * */
      //if (
      //!errForCadenceLeads &&
      //cadenceLead &&
      //cadenceLead?.status !== CADENCE_LEAD_STATUS.IN_PROGRESS
      //) {
      //logger.info(
      //`Cadence is stopped for lead(conditionally), so not creating further tasks.`
      //);
      //continue;
      //}

      // * Check if status of lead is not 'new lead' or 'ongoing'
      if (![LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING].includes(lead.status)) {
        logger.info(
          `LEAD STATUS: ${lead.status} is not valid for creating a task.`
        );
        continue;
      }

      // TODO: store user in an object, and reuse
      // * fetch user
      const [salesPerson, errForSalesPerson] =
        await UserRepository.findUserByQuery({ user_id: lead.user_id });

      // * If salesperson not found
      if (errForSalesPerson || !salesPerson) {
        logger.info(
          `Salesperson not found for lead ${lead?.lead_id}, Skipping it.`
        );
        continue;
      }

      // * Is it is first task, start time should be now(UNIX timestamp)
      let startTime = new Date().getTime();

      // no wait time if its the first task
      const wait_time = firstTask ? 0 : node.wait_time;

      if (
        lead_integration_type !== LEAD_INTEGRATION_TYPES.PRODUCT_TOUR_EXCEL_LEAD
      )
        // * calculate start time for task, using current time
        startTime = await getStartTimeForTask(
          salesPerson.timezone,
          wait_time,
          emailSetting
        );

      // add to_show as false for callback-task
      let to_show = true;
      if (node.type === NODE_TYPES.CALLBACK) to_show = false;

      const [createdTask, errForCreatedTask] = await TaskRepository.createTask({
        name: TASK_NAMES_BY_TYPE[node.type],
        start_time: startTime,
        late_time:
          lead_integration_type !==
          LEAD_INTEGRATION_TYPES.PRODUCT_TOUR_EXCEL_LEAD
            ? startTime + late_time
            : null,
        shown_time:
          lead_integration_type !==
          LEAD_INTEGRATION_TYPES.PRODUCT_TOUR_EXCEL_LEAD
            ? null
            : startTime,
        /**
         * * If delayForUrgent is 0 then tag name is neither inbound nor outbound, so keep it as 0
         */
        urgent_time: delayForUrgent
          ? startTime + delayForUrgent
          : delayForUrgent,
        lead_id: lead.lead_id,
        user_id: lead.user_id,
        node_id: node.node_id,
        cadence_id,
        to_show,
        status: TASK_STATUSES.INCOMPLETE,
      });

      // push into created tasks
      createdTasks.push(createdTask);

      let isSkipped = false;

      // *  Check if lead has unsubscribed
      if (cadenceLead.dataValues.unsubscribed) {
        const [settings, errForSettings] = await getSettingsForUser({
          user_id: lead.user_id,
          setting_type: SETTING_TYPES.UNSUBSCRIBE_MAIL_SETTINGS,
        });
        if (errForSettings)
          return [null, `Error while fetching settings: ${errForSettings}`];

        let unsubscribe_settings;

        if (node.type == NODE_TYPES.AUTOMATED_MAIL)
          unsubscribe_settings =
            settings?.Unsubscribe_Mail_Setting?.automatic_unsubscribed_data;
        else
          unsubscribe_settings =
            settings?.Unsubscribe_Mail_Setting
              ?.semi_automatic_unsubscribed_data;

        // * If node type is not allowed for unsubscribed user, skip task
        if (
          settings?.Unsubscribe_Mail_Setting !== null &&
          unsubscribe_settings[node.type]
        ) {
          isSkipped = true;

          await TaskRepository.updateTask(
            {
              task_id: createdTask.dataValues.task_id,
            },
            {
              is_skipped: true,
              skip_time: new Date().getTime(),
              status: TASK_STATUSES.SKIPPED,
            }
          );

          // * Fetch next node
          const [nextNode, errForNextNode] = await NodeRepository.getNode({
            node_id: node.next_node_id,
          });
          if (errForNextNode)
            return [null, `Error while fetching node: ${errForNextNode}`];

          if (nextNode)
            await createTasksForLeads({
              leads: [lead],
              node: nextNode,
              cadence_id: createdTask.cadence_id,
              firstTask: false,
            });
          else {
            const [cadence, errForCadence] = await Repository.fetchOne({
              tableName: DB_TABLES.CADENCE,
              query: { cadence_id },
              attributes: ['name'],
            });
            if (cadence?.name) {
              const [activityFromTemplate, errForActivityFromTemplate] =
                ActivityHelper.getActivityFromTemplates({
                  type: ACTIVITY_TYPE.COMPLETED_CADENCE,
                  variables: {
                    cadence_name: cadence.name,
                  },
                  activity: {
                    lead_id: lead.lead_id,
                    incoming: null,
                    node_id: node.node_id,
                  },
                });

              // create and send activity through socket
              ActivityHelper.activityCreation(
                activityFromTemplate,
                lead.user_id
              );
              let applyWorkflow =
                dependencies?.applyWorkflow ||
                require('../workflow/applyWorkflow');
              applyWorkflow({
                trigger: WORKFLOW_TRIGGERS.WHEN_A_CADENCE_ENDS,
                lead_id: lead.lead_id,
                cadence_id,
              });
            }
          }
        }
      }
      // check if bounced
      else if (cadenceLead.dataValues.is_bounced) {
        const [settings, errForSettings] = await getSettingsForUser({
          user_id: lead.user_id,
          setting_type: SETTING_TYPES.BOUNCED_MAIL_SETTINGS,
        });
        if (errForSettings)
          return [null, `Error while fetching settings: ${errForSettings}`];

        let bounced_settings;

        if (node.type == NODE_TYPES.AUTOMATED_MAIL)
          bounced_settings =
            settings?.Bounced_Mail_Setting?.automatic_bounced_data;
        else
          bounced_settings =
            settings?.Bounced_Mail_Setting?.semi_automatic_bounced_data;
        // Bounced_Mail_Settings
        // * If node type is not allowed for bounced user, skip task
        if (
          settings?.Bounced_Mail_Setting !== null &&
          bounced_settings[node?.type]
        ) {
          isSkipped = true;
          await TaskRepository.updateTask(
            {
              task_id: createdTask.dataValues.task_id,
            },
            {
              is_skipped: true,
              skip_time: new Date().getTime(),
              status: TASK_STATUSES.SKIPPED,
            }
          );

          // * Fetch next node
          const [nextNode, errForNextNode] = await NodeRepository.getNode({
            node_id: node.next_node_id,
          });
          if (errForNextNode)
            return [null, `Error while fetching node: ${errForNextNode}`];

          if (nextNode)
            await createTasksForLeads({
              leads: [lead],
              node: nextNode,
              cadence_id: createdTask.cadence_id,
              firstTask: false,
            });
          else {
            const [cadence, errForCadence] = await Repository.fetchOne({
              tableName: DB_TABLES.CADENCE,
              query: { cadence_id },
              attributes: ['name'],
            });
            if (cadence?.name) {
              const [activityFromTemplate, errForActivityFromTemplate] =
                ActivityHelper.getActivityFromTemplates({
                  type: ACTIVITY_TYPE.COMPLETED_CADENCE,
                  variables: {
                    cadence_name: cadence.name,
                  },
                  activity: {
                    lead_id: lead.lead_id,
                    incoming: null,
                    node_id: node.node_id,
                  },
                });

              // create and send activity through socket
              ActivityHelper.activityCreation(
                activityFromTemplate,
                lead.user_id
              );

              let applyWorkflow =
                dependencies?.applyWorkflow ||
                require('../workflow/applyWorkflow');
              applyWorkflow({
                trigger: WORKFLOW_TRIGGERS.WHEN_A_CADENCE_ENDS,
                lead_id: lead.lead_id,
                cadence_id,
              });
            }
          }
        }
      } else if (
        [NODE_TYPES.REPLY_TO, NODE_TYPES.AUTOMATED_REPLY_TO].includes(
          node.type
        ) &&
        !isSkipped
      ) {
        let toSkip = false;

        if (node.data?.replied_node_id) {
          const [repliedNode, errForRepliedNode] = await Repository.fetchOne({
            tableName: DB_TABLES.NODE,
            query: {
              node_id: node.data.replied_node_id,
            },
          });
          if (errForRepliedNode)
            logger.error(
              `Error while fetching replied node for reply to task: `,
              errForRepliedNode
            );

          if (repliedNode) {
            const taskPromise = Repository.fetchOne({
              tableName: DB_TABLES.TASK,
              query: {
                lead_id: lead.lead_id,
                cadence_id,
                node_id: repliedNode.node_id,
              },
            });

            // Also Skip if Original mail is bounced
            const mailPromise = Repository.fetchOne({
              tableName: DB_TABLES.EMAIL,
              query: {
                lead_id: lead.lead_id,
                cadence_id,
                node_id: repliedNode.node_id,
              },
            });

            const [[mailTask, errForMailTask], [ogMail, errForOgMail]] =
              await Promise.all([taskPromise, mailPromise]);
            if (errForMailTask)
              logger.error(
                `Error while fetching mail task for reply node: `,
                errForMailTask
              );

            if (errForOgMail)
              logger.error(
                `Error while fetching email for reply node: `,
                errForOgMail
              );

            if (ogMail && lead.user_id != ogMail.user_id) toSkip = true;

            if (
              !mailTask ||
              mailTask.is_skipped ||
              ogMail?.status === EMAIL_STATUS.BOUNCED
            )
              toSkip = true;
          } else toSkip = true;
        } else toSkip = true;

        if (toSkip) {
          await TaskRepository.updateTask(
            {
              task_id: createdTask.dataValues.task_id,
            },
            {
              is_skipped: true,
              skip_time: new Date().getTime(),
              status: TASK_STATUSES.SKIPPED,
            }
          );
          // * Fetch next node
          const [nextNode, errForNextNode] = await NodeRepository.getNode({
            node_id: node.next_node_id,
          });
          if (errForNextNode)
            return [null, `Error while fetching node: ${errForNextNode}`];

          if (nextNode) {
            await createTasksForLeads({
              leads: [lead],
              node: nextNode,
              cadence_id: createdTask.cadence_id,
              firstTask: false,
            });
          }
        }
      }
      if (errForCreatedTask) {
        logger.error(
          `Error occurred while creating task for ${lead.first_name} ${lead.last_name}.`
        );
        continue;
      }
      logger.info(`Created task for ${lead.first_name} ${lead.last_name}.`);
    }

    logger.info(
      `Attempted to create tasks for ${leads.length} leads in cadence: ${cadence_id}.`
    );
    if (createdTasks.length) return [createdTasks, null];
    else return ['Created task successfully.', null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while creating tasks for leads: `, err);
    return [null, err.message];
  }
};

module.exports = createTasksForLeads;
