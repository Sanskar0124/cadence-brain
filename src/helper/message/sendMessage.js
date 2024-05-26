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
const RingoverService = require('../../services/Ringover');
const UserHelper = require('../user');

const sendMessage = async ({
  messageToSend,
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
      await UserHelper.checkIfDailyLimitReachedForMessage(salesPerson);

    if (errForDailyLimitReached) return [null, errForDailyLimitReached];

    const { ringover_api_key, from_phone_number, to_phone_number, content } =
      messageToSend;

    const [messageData, errForMessageData] = await RingoverService.Message.send(
      ringover_api_key,
      from_phone_number,
      to_phone_number,
      content,
      task.lead_id
    );

    if (errForMessageData) {
      logger.error(
        `Error while sending automated message: ${errForMessageData}.`
      );
      return [null, `Error while sending automated message.`];
    }

    // * Incrementing 'automated_mails_sent_per_day' for salesPerson by 1
    let userTaskUpdateData = await User_Task.update(
      {
        automated_messages_sent_per_day: sequelize.literal(
          'automated_messages_sent_per_day+ 1'
        ),
      },
      {
        where: {
          user_id: task.user_id,
        },
      }
    );

    if (userTaskUpdateData?.[0])
      logger.info(`Updated automated_messages_sent_per_day.`);

    return [`Message sent`, null];
  } catch (err) {
    logger.error(`Error while sending message: `, err);
    return [null, err.message];
  }
};

module.exports = sendMessage;
