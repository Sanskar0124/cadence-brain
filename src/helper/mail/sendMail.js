// Utils
const logger = require('../../utils/winston');

// Models
const {
  Task,
  User_Task,
  Lead,
  Status,
  Node,
  sequelize,
} = require('../../db/models');

// Helpers and Services
// const MailService = require('../../services/Google/Mail');
const UserHelper = require('../user');
const MailService = require('../../grpc/v2/mail');

const handleMailInCallback = async ({
  mailToSend,
  task,
  node,
  salesPerson,
  lead,
}) => {
  try {
    const fetchedTask = await Task.findOne({
      where: {
        task_id: task?.task_id,
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
    const [mailData, errForMailData] = await MailService.sendMail(mailToSend);

    if (errForMailData) {
      logger.error(`Error while sending automated mail: ${errForMailData}.`);
      return [null, `Error while sending automated mail: ${errForMailData}.`];
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

    return [`Mail sent`, null];
  } catch (err) {
    logger.error(`Error while handling mail in callback: ${err.message}.`);
    return [null, err.message];
  }
};

module.exports = handleMailInCallback;
