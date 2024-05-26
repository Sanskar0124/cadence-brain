// Utils
const logger = require('../../utils/winston');
const {
  NODE_TYPES,
  LEAD_STATUS,
  CADENCE_LEAD_STATUS,
  ACTIVITY_TYPE,
  SETTING_TYPES,
  WORKFLOW_TRIGGERS,
  CALLBACK_DEVICES,
  ACTIVITY_SUBTYPES,
  CALL_DIRECTION,
  TASK_STATUSES,
  MAIL_SCOPE_LEVEL,
} = require('../../utils/enums');
const {
  REDIS_ADDED_TASK_IDS,
  DAILY_USER_TASKS_QUEUE,
  REDIS_ADDED_USER_IDS_FOR_MESSAGE,
  REDIS_ADDED_USER_IDS_FOR_MAIL,
  REDIS_AUTOMATED_TASK,
  AMQP_DELAY_EXCHANGE,
} = require('../../utils/constants');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Models
const {
  Email_Settings,
  Task,
  Node,
  Lead,
  User,
  Status,
  Account,
  Cadence,
  LeadToCadence,
  Lead_phone_number,
  sequelize,
} = require('../../db/models');

// Repositories
const CadenceRepository = require('../../repository/cadence.repository');
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');
const Repository = require('../../repository');

// Helpers and Services
const MailHelper = require('../mail');
const UserHelper = require('../user');
const RedisHelper = require('../redis');
const createTasksForLeads = require('./createTasksForLeads');
const AutomatedSettingsHelper = require('../automated-settings');
const checkIfTaskIsExecutable = require('./checkIfTaskIsExecutable');
const produce = require('../rabbitmq/produce'); // importing directly file instead of helper due to circular dependency
const MessageHelper = require('../message');
const ActivityHelper = require('../activity');
const WorkflowHelper = require('../workflow');
const handleEndCadenceTask = require('./handleEndCadenceTask');
const recalculateDailyTasksForUsers = require('./recalculateDailyTasksForUsers');
const CallHelper = require('../call');
const LinkedinHelper = require('../linkedin');
const VariablesHelper = require('../variables');
const logToIntegration = require('../logToIntegration');

const consumeTaskFromQueue = async (automatedTask) => {
  try {
    console.log(' ------ [consumeTaskFromQueue] ------>');
    logger.info(JSON.stringify(automatedTask, null, 4));
    logger.info(
      `Automated task received with start_time: ${automatedTask?.start_time} with id : ${automatedTask?.at_id}...`
    );

    // if automatedTask does not have at_id or start_time, it is not valid
    if (!automatedTask?.at_id || !automatedTask?.start_time) {
      logger.error(
        `Not valid since automated task received from queue has at_id: ${automatedTask?.at_id}, start_time: ${automatedTask?.start_time}.`
      );
      // delete automatedTask
      const [data, err] = await Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: { at_id: automatedTask?.at_id },
      });
      if (data)
        logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
      else
        logger.info(
          `Could not delete automated task with id ${automatedTask?.at_id}.`
        );

      return [
        null,
        `Not valid since automated task received from queue has at_id: ${automatedTask?.at_id}, start_time: ${automatedTask?.start_time}.`,
      ];
    }

    const [checkIfExistsInRedis, errForCheckIfExistsInRedis] =
      await RedisHelper.setIfNotExists(
        `${REDIS_AUTOMATED_TASK}_${automatedTask.task_id}`,
        1
      );
    if (errForCheckIfExistsInRedis) {
      logger.error(
        `Could not set redis value for automated_task with task_id: ${automatedTask.task_id}`
      );
      // delete automatedTask
      const [data, err] = await Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: { at_id: automatedTask?.at_id },
      });
      if (data)
        logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
      else
        logger.info(
          `Could not delete automated task with id ${automatedTask?.at_id}.`
        );
      return [
        null,
        `Could not set redis value for automated_task: ${automatedTask.at_id}`,
      ];
    }

    // check for automatedTask entry
    const [automatedTaskEntry, errForAutomatedTaskEntry] =
      await Repository.fetchOne({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: {
          at_id: automatedTask?.at_id,
          start_time: automatedTask?.start_time,
          added: 1,
        },
      });
    if (!automatedTaskEntry) {
      logger.error(
        `Error while finding automatedTask  with id: ${automatedTask?.at_id} and start_time: ${automatedTask?.start_time}.`
      );
      // delete automatedTask
      const [data, err] = await Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: { at_id: automatedTask?.at_id },
      });
      if (data)
        logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
      else
        logger.info(
          `Could not delete automated task with id ${automatedTask?.at_id}.`
        );
      return [
        null,
        `Error while finding automatedTask  with id: ${automatedTask?.at_id} and start_time: ${automatedTask?.start_time}.`,
      ];
    }

    // * Fetch task
    const [fetchedTask, errForFetchedTask] = await Repository.fetchOne({
      tableName: DB_TABLES.TASK,
      query: { task_id: automatedTask.task_id },
      include: {
        [DB_TABLES.NODE]: {},
        [DB_TABLES.USER]: {
          [DB_TABLES.USER_TOKEN]: {
            attributes: ['encrypted_linkedin_cookie', 'linkedin_cookie'],
          },
        },
        [DB_TABLES.CADENCE]: {},
        [DB_TABLES.LEAD]: {
          subQuery: false,
          required: true,
          [DB_TABLES.ACCOUNT]: {},
          [DB_TABLES.LEADTOCADENCE]: {
            subQuery: false,
            required: true,
            where: {
              cadence_id: {
                [Op.eq]: sequelize.col('Task.cadence_id'),
              },
            },
          },
          [DB_TABLES.LEAD_PHONE_NUMBER]: {},
          [DB_TABLES.USER]: {},
        },
      },
    });
    if (!fetchedTask) {
      logger.error(
        `Error while finding task with id: ${automatedTask?.task_id}.`
      );
      // delete automatedTask
      const [data, err] = await Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: { at_id: automatedTask?.at_id },
      });
      if (data)
        logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
      else
        logger.info(
          `Could not delete automated task with id ${automatedTask?.at_id}.`
        );
      return [
        null,
        `Error while finding task with id: ${automatedTask?.task_id}.`,
      ];
    }

    let task = fetchedTask;
    logger.info(`Running task: ${task.name} with id : ${task.task_id}...`);

    // * check if task is already completed
    if (fetchedTask.completed) {
      logger.info(`Task : ${task.task_id} is already completed.`);
      // * remove task_id from redis array
      //await RedisHelper.removeValueFromArray(
      //REDIS_ADDED_TASK_IDS,
      //task?.task_id
      //);
      // delete automatedTask
      const [data, err] = await Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: { at_id: automatedTask?.at_id },
      });
      if (data)
        logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
      else
        logger.info(
          `Could not delete automated task with id ${automatedTask?.at_id}.`
        );
      return [null, `Task : ${task.task_id} is already completed.`];
    }

    // * check if task is executable
    const [isExecutable, errForIsExecutable] =
      checkIfTaskIsExecutable(fetchedTask);

    // * If not executable, return
    if (!isExecutable) {
      logger.error(`Task not executable: ${errForIsExecutable}.`);

      //await RedisHelper.removeValueFromArray(
      //REDIS_ADDED_TASK_IDS,
      //task?.task_id
      //);
      // delete automatedTask
      const [data, err] = await Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: { at_id: automatedTask?.at_id },
      });
      if (data)
        logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
      else
        logger.info(
          `Could not delete automated task with id ${automatedTask?.at_id}.`
        );

      return [null, `Not executable`];
    }

    const { Lead: lead, User: salesPerson, Node: requiredNode } = fetchedTask;
    let isSkipped = false;

    logger.info(`Lead: ${lead.first_name} ${lead.last_name}.`);

    if (!salesPerson) {
      logger.info(`No sales person found for lead: ${lead.lead_id}.`);
      // * remove task_id from redis array
      //await RedisHelper.removeValueFromArray(
      //REDIS_ADDED_TASK_IDS,
      //task?.task_id
      //);
      // delete automatedTask
      const [data, err] = await Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: { at_id: automatedTask?.at_id },
      });
      if (data)
        logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
      else
        logger.info(
          `Could not delete automated task with id ${automatedTask?.at_id}.`
        );
      return [null, `No sales person found for lead: ${lead.lead_id}.`];
    }

    logger.info(
      `Sales Person: ${salesPerson.first_name} ${salesPerson.last_name}.`
    );

    const [setting, errForSetting] = await UserHelper.getSettingsForUser({
      user_id: salesPerson.user_id,
      setting_type: SETTING_TYPES.AUTOMATED_TASK_SETTINGS,
    });
    if (errForSetting) {
      // delete automatedTask
      const [data, err] = await Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: { at_id: automatedTask?.at_id },
      });
      if (data)
        logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
      else
        logger.info(
          `Could not delete automated task with id ${automatedTask?.at_id}.`
        );
      return [null, errForSetting];
    }
    let automatedSetting = setting.Automated_Task_Setting;

    // * If today is not a working day, update start time to start time of next working day
    if (
      !(
        AutomatedSettingsHelper.isTodayWorkingDay(automatedSetting) &&
        AutomatedSettingsHelper.isInWorkingTime(
          automatedSetting,
          salesPerson.timezone
        )
      )
    ) {
      logger.info(`OUTSIDE WORKING HOUR..UPDATING START TIME.`);
      const startTimeForNextWorkingDay =
        AutomatedSettingsHelper.getStartTimeForNextWorkingDay(
          automatedSetting,
          salesPerson.timezone
        );
      logger.info(`START TIME: ${startTimeForNextWorkingDay}.`);
      await Task.update(
        { start_time: startTimeForNextWorkingDay },
        {
          where: {
            task_id: task.task_id,
          },
        }
      );

      //await RedisHelper.removeValueFromArray(
      //REDIS_ADDED_TASK_IDS,
      //task?.task_id
      //);

      // delete automatedTask
      const [data, err] = await Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: { at_id: automatedTask?.at_id },
      });
      if (data)
        logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
      else
        logger.info(
          `Could not delete automated task with id ${automatedTask?.at_id}.`
        );

      return [null, `Updated start_time since its outside working hour.`];
    }

    if (
      requiredNode?.type === NODE_TYPES.AUTOMATED_MAIL ||
      (requiredNode?.type === NODE_TYPES.MAIL &&
        fetchedTask.status === TASK_STATUSES.SCHEDULED)
    ) {
      let [email, errForEmail] = await Repository.fetchOne({
        tableName: DB_TABLES.EMAIL,
        query: { lead_id: task.lead_id, node_id: task.node_id },
      });
      if (email) isSkipped = true;
      else {
        const [dailyLimitReached, errForDailyLimitReached] =
          await UserHelper.checkIfDailyLimitReachedForEmail(
            salesPerson,
            null,
            automatedSetting
          );

        if (
          errForDailyLimitReached ===
          `Automated mail count per day exceeded for user ${salesPerson.first_name} ${salesPerson.last_name}.`
        ) {
          // * remove task_id from redis array
          //await RedisHelper.removeValueFromArray(
          //REDIS_ADDED_TASK_IDS,
          //task?.task_id
          //);
          await RedisHelper.appendValueToArray(
            REDIS_ADDED_USER_IDS_FOR_MAIL,
            task?.user_id
          );
          // delete automatedTask
          const [data, err] = await Repository.destroy({
            tableName: DB_TABLES.AUTOMATED_TASKS,
            query: { at_id: automatedTask?.at_id },
          });
          if (data)
            logger.info(
              `Deleted automated task with id ${automatedTask?.at_id}.`
            );
          else
            logger.info(
              `Could not delete automated task with id ${automatedTask?.at_id}.`
            );
          return [null, errForDailyLimitReached];
        }

        let processed;
        let errForProcessed;

        // * If scheduled, process using metadata.scheduled_mail
        if (
          requiredNode?.type === NODE_TYPES.MAIL &&
          fetchedTask.status === TASK_STATUSES.SCHEDULED
        ) {
          [processed, errForProcessed] = await MailHelper.processScheduledMail({
            task: fetchedTask,
            user: salesPerson,
            lead,
          });
        } else {
          // * Process automated mail
          [processed, errForProcessed] = await MailHelper.processAutomatedMail({
            task: fetchedTask,
            salesPerson,
            lead,
            node: requiredNode,
            automatedSetting,
            // toWait: mailTasksExecutedByUser[task?.user_id] || 0,
          });
        }

        if (errForProcessed) {
          logger.error(
            `Error occurred while processing mail: ${errForProcessed}.`
          );
          // * remove task_id from redis array
          //await RedisHelper.removeValueFromArray(
          //REDIS_ADDED_TASK_IDS,
          //task?.task_id
          //);
          // delete automatedTask
          const [data, err] = await Repository.destroy({
            tableName: DB_TABLES.AUTOMATED_TASKS,
            query: { at_id: automatedTask?.at_id },
          });

          if (data)
            logger.info(
              `Deleted automated task with id ${automatedTask?.at_id}.`
            );
          else
            logger.info(
              `Could not delete automated task with id ${automatedTask?.at_id}.`
            );
          return [null, errForProcessed];
        }
        if (processed === `Primary mail not found for lead.`) isSkipped = true;
      }
    } else if (requiredNode?.type === NODE_TYPES.AUTOMATED_MESSAGE) {
      // process an automated message task

      const [dailyLimitReached, errForDailyLimitReached] =
        await UserHelper.checkIfDailyLimitReachedForMessage(salesPerson);

      if (
        errForDailyLimitReached ===
        `Automated message count per day exceeded for user ${salesPerson.first_name} ${salesPerson.last_name}.`
      ) {
        // * remove task_id from redis array
        //await RedisHelper.removeValueFromArray(
        //REDIS_ADDED_TASK_IDS,
        //task?.task_id
        //);
        await RedisHelper.appendValueToArray(
          REDIS_ADDED_USER_IDS_FOR_MESSAGE,
          task?.user_id
        );
        // delete automatedTask
        const [data, err] = await Repository.destroy({
          tableName: DB_TABLES.AUTOMATED_TASKS,
          query: { at_id: automatedTask?.at_id },
        });
        if (data)
          logger.info(
            `Deleted automated task with id ${automatedTask?.at_id}.`
          );
        else
          logger.info(
            `Could not delete automated task with id ${automatedTask?.at_id}.`
          );
        return [null, errForDailyLimitReached];
      }

      const [processed, errForProcessed] =
        await MessageHelper.processAutomatedMessage({
          task: fetchedTask,
          salesPerson,
          lead,
          node: requiredNode,
        });

      if (errForProcessed) {
        logger.error(
          `Error occured while processing message: ${errForProcessed}.`
        );
        // * remove task_id from redis array
        //await RedisHelper.removeValueFromArray(
        //REDIS_ADDED_TASK_IDS,
        //task?.task_id
        //);
        // delete automatedTask
        const [data, err] = await Repository.destroy({
          tableName: DB_TABLES.AUTOMATED_TASKS,
          query: { at_id: automatedTask?.at_id },
        });
        if (data)
          logger.info(
            `Deleted automated task with id ${automatedTask?.at_id}.`
          );
        else
          logger.info(
            `Could not delete automated task with id ${automatedTask?.at_id}.`
          );
        return [null, errForProcessed];
      }
      if (processed === `Skip this task and create next.`) isSkipped = true;
    } else if (
      requiredNode?.type === NODE_TYPES.AUTOMATED_REPLY_TO ||
      (requiredNode?.type === NODE_TYPES.REPLY_TO &&
        fetchedTask.status === TASK_STATUSES.SCHEDULED)
    ) {
      let [email, errForEmail] = await Repository.fetchOne({
        tableName: DB_TABLES.EMAIL,
        query: { lead_id: task.lead_id, node_id: task.node_id },
      });
      if (email) isSkipped = true;
      else {
        // * Fetch email scope level from company settings
        const [companySettings, errFetchingCompanySettings] =
          await Repository.fetchOne({
            tableName: DB_TABLES.COMPANY_SETTINGS,
            query: {
              company_id: lead.company_id,
            },
            extras: {
              attributes: ['email_scope_level'],
            },
          });
        if (errFetchingCompanySettings)
          return [null, errFetchingCompanySettings];

        if (companySettings.email_scope_level === MAIL_SCOPE_LEVEL.STANDARD) {
          logger.error('Reply to is not allowed for standard mail scope.');
          isSkipped = true;
        } else {
          const [dailyLimitReached, errForDailyLimitReached] =
            await UserHelper.checkIfDailyLimitReachedForEmail(
              salesPerson,
              null,
              automatedSetting
            );

          if (
            errForDailyLimitReached ===
            `Automated mail count per day exceeded for user ${salesPerson.first_name} ${salesPerson.last_name}.`
          ) {
            // * remove task_id from redis array
            //await RedisHelper.removeValueFromArray(
            //REDIS_ADDED_TASK_IDS,
            //task?.task_id
            //);
            await RedisHelper.appendValueToArray(
              REDIS_ADDED_USER_IDS_FOR_MAIL,
              task?.user_id
            );
            // delete automatedTask
            const [data, err] = await Repository.destroy({
              tableName: DB_TABLES.AUTOMATED_TASKS,
              query: { at_id: automatedTask?.at_id },
            });
            if (data)
              logger.info(
                `Deleted automated task with id ${automatedTask?.at_id}.`
              );
            else
              logger.info(
                `Could not delete automated task with id ${automatedTask?.at_id}.`
              );
            return [null, errForDailyLimitReached];
          }

          let processed;
          let errForProcessed;

          // * If scheduled, process using metadata.scheduled_mail
          if (
            requiredNode?.type === NODE_TYPES.REPLY_TO &&
            fetchedTask.status === TASK_STATUSES.SCHEDULED
          ) {
            [processed, errForProcessed] =
              await MailHelper.processScheduledReply({
                task: fetchedTask,
                user: salesPerson,
                lead,
                node: requiredNode,
              });
          } else {
            [processed, errForProcessed] =
              await MailHelper.processAutomatedReply({
                task: fetchedTask,
                salesPerson,
                lead,
                node: requiredNode,
                automatedSetting,
                // toWait: mailTasksExecutedByUser[task?.user_id] || 0,
              });
          }

          if (errForProcessed) {
            logger.error(
              `Error occurred while processing reply: ${errForProcessed}.`
            );
            // * remove task_id from redis array
            //await RedisHelper.removeValueFromArray(
            //REDIS_ADDED_TASK_IDS,
            //task?.task_id
            //);
            // delete automatedTask
            const [data, err] = await Repository.destroy({
              tableName: DB_TABLES.AUTOMATED_TASKS,
              query: { at_id: automatedTask?.at_id },
            });

            if (data)
              logger.info(
                `Deleted automated task with id ${automatedTask?.at_id}.`
              );
            else
              logger.info(
                `Could not delete automated task with id ${automatedTask?.at_id}.`
              );
            return [null, errForProcessed];
          }
          if (processed === `Primary mail not found for lead.`) {
            logger.error(`Primary mail not found.`);
            isSkipped = true;
          }
        }
      }
    } else if (requiredNode?.type === NODE_TYPES.END) {
      let [data, err] = await handleEndCadenceTask({
        node: requiredNode,
        lead,
      });
      let metadata = { task_reason: '' };
      // save the error in metadata for the end cadence task
      if (err) metadata.task_reason = err;

      if (data) {
        if (data === `Moved,but creating task pending.`) {
          const [requiredNodeForNewTask, errForRequiredNodeForNewTask] =
            await Repository.fetchOne({
              tableName: DB_TABLES.NODE,
              query: {
                cadence_id: requiredNode?.data?.cadence_id,
                is_first: 1,
              },
            });
          if (errForRequiredNodeForNewTask)
            return [null, errForRequiredNodeForNewTask];

          const [taskCreated, errForTaskCreated] = await createTasksForLeads({
            leads: [lead],
            node: requiredNodeForNewTask,
            cadence_id: requiredNode?.data?.cadence_id,
            firstTask: true,
          });

          if (!requiredNodeForNewTask.wait_time && taskCreated)
            recalculateDailyTasksForUsers([lead?.user_id]);
        }
      }

      // mark task as completed and save task reason in metadata
      await Repository.update({
        tableName: DB_TABLES.TASK,
        query: { task_id: task.task_id },
        updateObject: {
          completed: 1, // mark as completed
          status: TASK_STATUSES.COMPLETED,
          metadata, // save reason if someting unexpected happened
        },
      });
      // delete automatedTask
      [data, err] = await Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: { at_id: automatedTask?.at_id },
      });
      if (data)
        logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
      else
        logger.info(
          `Could not delete automated task with id ${automatedTask?.at_id}.`
        );

      return [`Handled end cadence task successfully`, null];
    } else if (requiredNode?.type === NODE_TYPES.CALLBACK) {
      // check if user is available for callback task
      const [isAvailable, errForIsAvailable] =
        await UserHelper.checkIfUserIsAvailableForCallback({
          user_id: salesPerson.user_id,
        });
      if (errForIsAvailable) {
        logger.error(
          `Error occurred while checking if user is available for callback: ${errForIsAvailable}. \n Skipping task..`
        );
        isSkipped = true;
      }

      const deleteAutomatedTask = async () => {
        const [data, err] = await Repository.destroy({
          tableName: DB_TABLES.AUTOMATED_TASKS,
          query: { at_id: automatedTask?.at_id },
        });
        if (data)
          logger.info(
            `Deleted automated task with id ${automatedTask?.at_id}.`
          );
        else
          logger.info(
            `Could not delete automated task with id ${automatedTask?.at_id}.`
          );
      };

      if (isAvailable) {
        logger.info(`User is available for callback task.`);

        const [processed, processedErr] = await CallHelper.processCallbackTask({
          salesPerson,
          lead,
          node: requiredNode,
          task,
        });
        if (processedErr) {
          //for any kind of error skip task
          logger.error(
            `Error occurred while executing callback task: ${processedErr}.`
          );
          isSkipped = true;
        } else {
          //if callback --> send activity
          const { call_id, from, to, device } = processed;
          let [activity, errForActivity] =
            ActivityHelper.getActivityFromTemplates({
              type: ACTIVITY_TYPE.CALLBACK,
              sub_type: ACTIVITY_SUBTYPES.DEFAULT,
              variables: {
                lead_first_name: lead.first_name,
                lead_last_name: lead.last_name,
              },
              activity: {
                lead_id: lead.lead_id,
                ringover_call_id: call_id,
                // recording: callData.record, // url for call recording
                cadence_id: requiredNode.cadence_id,
                // comment: callData.note,
                from_number: from,
                to_number: to,
                node_id: task.node_id,
              },
            });
          logger.info('creating activity for callback', activity);
          await ActivityHelper.activityCreation(activity, task.user_id);
        }
      } else if (isAvailable === false) {
        // if not available-> implement retry logic -> if retries exceeded set to_show->true and destroy automated task else update start_time and retries in task and automated task

        const [retryRes, retryErr] = await CallHelper.retryCallbackTask({
          node: requiredNode,
          task,
        });

        if (retryErr) {
          logger.error(
            `Error occurred while retrying callback task: ${retryErr}.`
          );
          isSkipped = true;
        } else {
          await deleteAutomatedTask();
          return ['Retry logic executed successfully', null];
        }
      }
    } else if (
      [
        NODE_TYPES.AUTOMATED_LINKEDIN_CONNECTION,
        NODE_TYPES.AUTOMATED_LINKEDIN_MESSAGE,
        NODE_TYPES.AUTOMATED_LINKEDIN_PROFILE,
      ].includes(requiredNode?.type)
    ) {
      //TODO: Change to checkIfDailyLinkedInTaskLimit (for node) has been reached?
      const [dailyLimitReached, errForDailyLimitReached] =
        await UserHelper.checkIfDailyLimitReachedForEmail(
          salesPerson,
          null,
          automatedSetting
        );
      if (
        errForDailyLimitReached ===
        `Automated mail count per day exceeded for user ${salesPerson.first_name} ${salesPerson.last_name}.`
      ) {
        await RedisHelper.appendValueToArray(
          REDIS_ADDED_USER_IDS_FOR_MAIL,
          task?.user_id
        );
        // * Delete automatedTask
        const [data, err] = await Repository.destroy({
          tableName: DB_TABLES.AUTOMATED_TASKS,
          query: { at_id: automatedTask?.at_id },
        });
        if (data)
          logger.info(
            `Deleted automated task with id ${automatedTask?.at_id}.`
          );
        else
          logger.info(
            `Could not delete automated task with id ${automatedTask?.at_id}.`
          );
        return [null, errForDailyLimitReached];
      }

      // * Get LinkedIn Cookie
      const linkedin_cookie = salesPerson?.User_Token?.linkedin_cookie;

      // * If lead has no LinkedIn URL, Skip the task
      if (!lead.linkedin_url) {
        logger.info(
          `Lead does not have LinkedIn URL Associated, Skipping task : ${task.task_id}`
        );
        isSkipped = true;
      } else {
        // * Handle various LinkedIn Tasks

        let linkedinActivityType,
          errForLinkedIn = null;

        switch (requiredNode?.type) {
          case NODE_TYPES.AUTOMATED_LINKEDIN_CONNECTION:
            logger.info(
              `Sending Automated LinkedIn Connection request to lead_id : ${lead.lead_id}...`
            );
            [, errForLinkedIn] = await LinkedinHelper.sendConnectionRequest({
              linkedin_url: lead.linkedin_url,
              linkedin_cookie,
              message: requiredNode?.data?.message,
              lead_id: lead.lead_id,
              user_id: salesPerson.user_id,
            });
            linkedinActivityType = ACTIVITY_TYPE.LINKEDIN_CONNECTION;
            break;
          case NODE_TYPES.AUTOMATED_LINKEDIN_MESSAGE:
            logger.info(
              `Sending Automated LinkedIn Message to lead_id : ${lead.lead_id}...`
            );
            [, errForLinkedIn] = await LinkedinHelper.sendMessage({
              linkedin_url: lead.linkedin_url,
              linkedin_cookie,
              message: requiredNode?.data?.message,
              lead_id: lead.lead_id,
              user_id: salesPerson.user_id,
            });
            linkedinActivityType = ACTIVITY_TYPE.LINKEDIN_MESSAGE;
            break;
          case NODE_TYPES.AUTOMATED_LINKEDIN_PROFILE:
            logger.info(
              `Executing Automated LinkedIn Profile View for lead_id : ${lead.lead_id}...`
            );
            [, errForLinkedIn] = await LinkedinHelper.viewProfile({
              linkedin_url: lead.linkedin_url,
              linkedin_cookie,
              user_id: salesPerson.user_id,
            });
            linkedinActivityType = ACTIVITY_TYPE.LINKEDIN_PROFILE;
            break;
          default:
            logger.error(`Invalid automated LinkedIn Node type`);
            return [null, `Invalid automated LinkedIn Node type`];
        }

        if (errForLinkedIn) {
          // * If the error is "Request failed with status code 400" - It can imply that the user cannot view/send message (or connection request) for some unknown reason. Hence task must be skipped

          if (
            [
              'Request failed with status code 400',
              'Request failed with status code 422',
            ].includes(errForLinkedIn)
          ) {
            logger.info(
              `Cannot complete LinkedIn Automated task for unknown reason: ${task.task_id}`
            );
            isSkipped = true;
          } else {
            // * Delete automatedTask
            const [data, err] = await Repository.destroy({
              tableName: DB_TABLES.AUTOMATED_TASKS,
              query: { at_id: automatedTask?.at_id },
            });
            if (data)
              logger.info(
                `Deleted automated task with id ${automatedTask?.at_id}.`
              );
            else
              logger.info(
                `Could not delete automated task with id ${automatedTask?.at_id}.`
              );
            return [
              null,
              `Error while performing LinkedIn Action: ${errForLinkedIn}`,
            ];
          }
        } else {
          var [currentNodeMessage] =
            await VariablesHelper.replaceVariablesForLead(
              requiredNode?.data?.message,
              lead.lead_id
            );

          // * Create activity for linkedin node
          let [activity, errForActivity] =
            await ActivityHelper.createLinkedinActivity({
              lead,
              cadence_id: task.cadence_id,
              type: linkedinActivityType,
              node_id: requiredNode.node_id,
              status: currentNodeMessage,
            });
          if (errForActivity)
            logger.error(`Error while creating activity:`, errForActivity);

          if (activity) {
            logger.info('Created activity' + JSON.stringify(activity, null, 4));
            logToIntegration.logLinkedInToIntegration({
              lead_id: lead.lead_id,
              activity,
            });
          }
        }
      }
    } else {
      logger.info(
        `Not an automated mail/message/reply to/callback or end cadence task.`
      );
      // * Delete automatedTask
      const [data, err] = await Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_TASKS,
        query: { at_id: automatedTask?.at_id },
      });
      if (data)
        logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
      else
        logger.info(
          `Could not delete automated task with id ${automatedTask?.at_id}.`
        );
      return [null, `Not an automated mail/message task.`];
    }

    let taskUpdate = {};

    if (isSkipped)
      taskUpdate = {
        is_skipped: 1,
        status: TASK_STATUSES.SKIPPED,
        skip_time: new Date().getTime(),
      };
    else
      taskUpdate = {
        completed: true,
        status: TASK_STATUSES.COMPLETED,
        complete_time: new Date().getTime(),
      };

    // * Update task
    await Task.update(taskUpdate, {
      where: {
        // * query
        task_id: task.task_id,
      },
    });

    // * Apply workflow (WHEN_A_TASK_IS_SKIPPED) if task has been skipped
    if (isSkipped)
      WorkflowHelper.applyWorkflow({
        trigger: WORKFLOW_TRIGGERS.WHEN_A_TASK_IS_SKIPPED,
        cadence_id: fetchedTask.cadence_id,
        lead_id: fetchedTask.lead_id,
      });

    // * Apply workflow (WHEN_FIRST_AUTOMATED_TASK_IS_COMPLETED) if first automated task has been completed
    if (requiredNode.is_first && taskUpdate.completed) {
      WorkflowHelper.applyWorkflow({
        trigger: WORKFLOW_TRIGGERS.WHEN_FIRST_AUTOMATED_TASK_IS_COMPLETED,
        cadence_id: fetchedTask.cadence_id,
        lead_id: fetchedTask.lead_id,
      });
    }
    // * Remove task_id from redis array
    //await RedisHelper.removeValueFromArray(REDIS_ADDED_TASK_IDS, task?.task_id);
    // update automatedTask
    const [data, err] = await Repository.update({
      tableName: DB_TABLES.AUTOMATED_TASKS,
      query: { at_id: automatedTask?.at_id },
      updateObject: { added: 1, completed: 1 },
    });
    if (data?.[0])
      logger.info(`Update automated task with id ${automatedTask?.at_id}.`);
    else
      logger.info(
        `Could not update automated task with id ${automatedTask?.at_id}.`
      );

    // * If it is a task for first node, update contact time and status
    //TODO: HOW DO WE KNOW THIS?
    if (!isSkipped) {
      // * update contact time
      await Lead.update(
        {
          first_contact_time: new Date(),
          status: LEAD_STATUS.ONGOING,
        },
        {
          where: {
            lead_id: lead.lead_id,
            user_id: task?.user_id,
          },
        }
      );
      // * create entry in status table
      await Status.create({
        lead_id: lead?.lead_id,
        status: LEAD_STATUS.ONGOING,
        message: `Contacted by ${requiredNode?.type}.`,
      });
    }

    if (!requiredNode.next_node_id) {
      logger.info('No next node found.');

      const [currentCadence, errForCurrentCadence] =
        await CadenceRepository.getCadence({
          cadence_id: requiredNode.cadence_id,
        });
      await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
        {
          lead_id: task.lead_id,
          cadence_id: requiredNode.cadence_id,
        },
        {
          status: CADENCE_LEAD_STATUS.COMPLETED,
        }
      );

      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.COMPLETED_CADENCE,
          variables: {
            cadence_name: currentCadence.name,
          },
          activity: {
            lead_id: task.lead_id,
            incoming: null,
            node_id: task?.node_id ?? null,
          },
        });

      let [activity, errForActivity] = await ActivityHelper.activityCreation(
        activityFromTemplate,
        task.user_id
      );
      if (activity) logger.info('Created activity');

      WorkflowHelper.applyWorkflow({
        trigger: WORKFLOW_TRIGGERS.WHEN_A_CADENCE_ENDS,
        lead_id: task.lead_id,
        cadence_id: task.cadence_id,
      });

      return [`Cadence completed since no next node found.`, null];
    }

    const nextNode = await Node.findOne({
      where: {
        node_id: requiredNode.next_node_id,
      },
    });

    // console.log(lead);

    if (nextNode) {
      // * create task for next node
      const [taskCreated, errForTaskCreated] = await createTasksForLeads({
        leads: [lead],
        node: nextNode,
        cadence_id: task.cadence_id,
        firstTask: false,
      });

      // if there is no wait time and task is created then only recalculate task.
      // In case of delay it will be recalculated in cron.
      if (!nextNode.wait_time && taskCreated)
        produce(
          AMQP_DELAY_EXCHANGE,
          DAILY_USER_TASKS_QUEUE,
          JSON.stringify({ user_id: task?.user_id }),
          0
        );
    }

    logger.info(`Completed ${task?.task_id}.`);
    return [`Completed ${task?.task_id}.`, null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while consuming task from queue: ${err.message}.`);
    // delete automatedTask
    const [data, _] = await Repository.destroy({
      tableName: DB_TABLES.AUTOMATED_TASKS,
      query: { at_id: automatedTask?.at_id },
    });
    if (data)
      logger.info(`Deleted automated task with id ${automatedTask?.at_id}.`);
    else
      logger.info(
        `Could not delete automated task with id ${automatedTask?.at_id}.`
      );
    return [null, err.message];
  }
};

module.exports = consumeTaskFromQueue;
