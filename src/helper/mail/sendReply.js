// Utils
const logger = require('../../utils/winston');

// Models
const { User_Task, sequelize } = require('../../db/models');
const Repository = require('../../repository');
const { DB_TABLES } = require('../../utils/modelEnums');

// Helpers and Services
// const MailService = require('../../services/Google/Mail');
const UserHelper = require('../user');
const MailService = require('../../grpc/v2/mail');

const handleReplyInCallback = async ({
  mailToSend,
  task,
  node,
  salesPerson,
  lead,
}) => {
  try {
    const fetchedTask = await Repository.fetchOne({
      tableName: DB_TABLES.TASK,
      query: {
        task_id: task.task_id,
      },
    });

    if (fetchedTask?.completed) {
      logger.info(`Task : ${task.task_id} is already completed.`);
      return [null, `Task : ${task.task_id} is already completed.`];
    }
    const [dailyLimitReached, errForDailyLimitReached] =
      await UserHelper.checkIfDailyLimitReachedForEmail(salesPerson);

    if (errForDailyLimitReached) return [null, errForDailyLimitReached];
    // console.log(mailToSend);
    const [mailData, errForMailData] = await MailService.sendReply(mailToSend);

    if (errForMailData) {
      logger.error(`Error while sending automated reply: ${errForMailData}.`);
      return [null, `Error while sending automated reply: ${errForMailData}.`];
    }

    // * Incrementing 'automated_mails_sent_per_day' for salesPerson by 1
    let userTaskUpdateData = await User_Task.update(
      {
        automated_mails_sent_per_day: sequelize.literal(
          'automated_mails_sent_per_day + 1'
        ),
      },
      {
        where: {
          user_id: task.user_id,
        },
      }
    );

    if (userTaskUpdateData?.[0])
      logger.info(`Updated automated_mails_sent_per_day.`);

    return [`Reply sent`, null];
  } catch (err) {
    logger.error(`Error while handling reply in callback: `, err);
    return [null, err.message];
  }
};

module.exports = handleReplyInCallback;
