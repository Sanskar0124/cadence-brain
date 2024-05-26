//Utils
const logger = require('../../utils/winston');
const {
  NOTIFICATION_TYPES,
  CUSTOM_TASK_NODE_ID,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');
const { FRONTEND_URL } = require('../../utils/config');

//Repository
const Repository = require('../../repository');

// Models
const { sequelize } = require('../../db/models');

//Packages
const { Op } = require('sequelize');

//Helpers and Serivces
const SocketHelper = require('../socket');
const NotificationHelper = require('../notification');
const HtmlHelper = require('../html');
const AmazonService = require('../../services/Amazon');

const sendRemindersForCustomTasksCron = async () => {
  try {
    //fetch tasks due for reminder notification
    logger.info('Sending reminder notifications');
    const [tasks, errForFetchingTasks] = await Repository.fetchAll({
      tableName: DB_TABLES.TASK,
      query: {
        [Op.and]: [
          {
            start_time: {
              [Op.gt]: new Date().getTime(),
            },
          },
          sequelize.where(
            sequelize.literal('json_extract(task.metadata,"$.reminder_time")'),
            {
              [Op.gte]: sequelize.literal(
                'TIMESTAMPDIFF(MINUTE,NOW(),FROM_UNIXTIME(start_time/1000))'
              ),
            }
          ),
          sequelize.where(
            sequelize.literal(
              'json_extract(task.metadata,"$.is_reminder_sent")'
            ),
            {
              [Op.eq]: 0,
            }
          ),
        ],
      },
      include: {
        [DB_TABLES.USER]: {
          attributes: ['first_name', 'user_id', 'email'],
        },
        [DB_TABLES.LEAD]: {
          attributes: ['first_name', 'last_name'],
        },
      },
    });
    if (errForFetchingTasks) {
      logger.error(
        'Error while fetching required Tasks: ',
        errForFetchingTasks
      );
      return;
    }

    const taskPromises = [];
    tasks.forEach((task) => taskPromises.push(sendReminder(task)));
    let failedPromises = 0,
      successPromises = 0;
    const settledPromises = await Promise.allSettled(taskPromises);
    for (let settledPromise of settledPromises) {
      if (settledPromise.status === 'rejected') {
        logger.error(
          'Error while sending reminder for task',
          settledPromise.reason
        );
        failedPromises++;
      } else {
        const [updatedTask, _] = settledPromise.value;
        updatedTask ? successPromises++ : failedPromises++;
      }
    }
    if (failedPromises)
      logger.error(`Failed to send reminders for ${failedPromises} tasks`);

    logger.info(`Reminder for ${successPromises} tasks send successfully`);
  } catch (err) {
    logger.error('Error while sending reminder for custom task:', err);
  }
};

const sendReminder = async (task) => {
  try {
    const task_name = Object.keys(CUSTOM_TASK_NODE_ID).find(
      (key) => CUSTOM_TASK_NODE_ID[key] == task.node_id
    );
    const remaining_time = Math.ceil(
      (task.start_time - new Date().getTime()) / 60000
    );

    const [notificationTemplate, errForNotificationTemplate] =
      NotificationHelper.getNotificationFromTemplate({
        type: NOTIFICATION_TYPES.REMINDER,
        variables: {
          custom_task_name: task_name,
          user_id: task.user_id,
          lead_first_name: task.Lead?.first_name,
          lead_last_name: task.Lead?.last_name,
          reminder_time: remaining_time,
        },
        notification: {
          email: task?.User?.email,
          lead_id: task.lead_id,
          lead_first_name: task.Lead?.first_name,
          lead_last_name: task.Lead?.last_name,
          user_id: task.user_id,
        },
      });

    const inAppPromise = SocketHelper.sendNotification(notificationTemplate);
    let emailPromise = [];
    if (task.metadata.send_reminder_email)
      emailPromise = AmazonService.sendHtmlMails({
        subject: `Reminder: Your ${task_name} with ${task.Lead?.first_name} ${task.Lead?.last_name} is in ${remaining_time} mins`,
        body: HtmlHelper.taskReminder({
          first_name: task.User.first_name,
          reminder_time: remaining_time,
          lead_first_name: task.Lead?.first_name,
          lead_last_name: task.Lead?.last_name,
          task_type: task_name,
          url: `${FRONTEND_URL}/crm/leads/${task.lead_id}`,
        }),
        emailsToSend: [task.User.email],
      });

    const [[notification, errSendingNotification], [email, errSendingEmail]] =
      await Promise.all([inAppPromise, emailPromise]);

    if (errSendingNotification) {
      logger.error(
        `Error while sending notification :${errSendingNotification}`
      );
      return [null, errSendingNotification];
    }
    if (errSendingEmail) {
      logger.error(`Error while sending email :${errSendingEmail}`);
      return [null, errSendingEmail];
    }

    const [updatedTask, errUpdatingTask] = await Repository.update({
      tableName: DB_TABLES.TASK,
      query: {
        task_id: task.task_id,
      },
      updateObject: {
        metadata: sequelize.fn(
          'JSON_SET',
          sequelize.col('metadata'),
          '$.is_reminder_sent',
          1
        ),
      },
    });
    if (errUpdatingTask) {
      logger.error('Error while marking reminder: ', errUpdatingTask);
      return [null, errUpdatingTask];
    }
    return [updatedTask, null];
  } catch (err) {
    logger.error('Error sending notification: ', err);
    return [null, err.message];
  }
};

module.exports = sendRemindersForCustomTasksCron;

//SELECT TIMESTAMPDIFF(MINUTE,NOW(),FROM_UNIXTIME(start_time/1000)),`Task`.`task_id`, `Task`.`name`, `Task`.`start_time`, `Task`.`shown_time`, `Task`.`late_time`, `Task`.`urgent_time`, `Task`.`complete_time`, `Task`.`skip_time`, `Task`.`lead_id`, `Task`.`user_id`, `Task`.`node_id`, `Task`.`cadence_id`, `Task`.`completed`, `Task`.`is_skipped`, `Task`.`metadata`, `Task`.`skip_reason`, `Task`.`to_show`, `Task`.`reminder_time`, `Task`.`send_reminder_email`, `Task`.`is_reminder_sent`, `Task`.`created_at`, `Task`.`updated_at`, `User`.`first_name` AS `User.first_name`, `User`.`user_id` AS `User.user_id`, `User`.`email` AS `User.email`, `Lead`.`lead_id` AS `Lead.lead_id`, `Lead`.`first_name` AS `Lead.first_name`, `Lead`.`last_name` AS `Lead.last_name` FROM `task` AS `Task` LEFT OUTER JOIN `user` AS `User` ON `Task`.`user_id` = `User`.`user_id` LEFT OUTER JOIN `lead` AS `Lead` ON `Task`.`lead_id` = `Lead`.`lead_id` WHERE `Task`.`start_time` > 1682603940514 AND `Task`.`is_reminder_sent` = 0;
