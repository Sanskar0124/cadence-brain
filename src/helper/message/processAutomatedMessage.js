// Utils
const logger = require('../../utils/winston');
const { TEMPLATE_TYPE, INTEGRATION_SERVICES } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Models
const { Task, User_Task, sequelize } = require('../../db/models');

// Repositories
const Repository = require('../../repository');

// Helpers
const UserHelper = require('../user');
const { chooseTemplate } = require('../abTesting');

// gRPC
const MessageClient = require('../../grpc/v2/message');

const processAutomatedMessage = async ({ task, salesPerson, lead, node }) => {
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

    // gRPC
    let ab_template_id;

    if (node.data?.aBTestEnabled) {
      // choose a template from templates and use it
      const [template, errForTemplate] = await chooseTemplate(
        node.data?.templates
      );
      if (errForTemplate)
        logger.error(`Error while choosing template`, errForTemplate);

      ab_template_id = template.ab_template_id;
      node.data.message = template.message;
    }

    const [messageData, errForMessageSent] = await MessageClient.sendMessage({
      integration_type: INTEGRATION_SERVICES.RINGOVER,
      message_data: {
        lead_id: lead.lead_id,
        content: node.data.message,
        cadence_id: node.cadence_id,
        node_id: node.node_id,
        ab_template_id,
        mt_id: node.data?.mt_id,
      },
    });
    const msg = messageData?.msg;

    if (msg === 'Skip this task and create next.' || errForMessageSent)
      return [`Skip this task and create next.`, null];

    // * Incrementing 'automated_messages_sent_per_day' for salesPerson by 1
    let userTaskUpdateData = await User_Task.update(
      {
        automated_messages_sent_per_day: sequelize.literal(
          'automated_messages_sent_per_day + 1'
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

    // * Update Template Used type
    let { template_type, template_id } = node?.data;
    if (template_type && template_id) {
      if (template_type === TEMPLATE_TYPE.SMS) {
        await Repository.update({
          tableName: DB_TABLES.MESSAGE_TEMPLATE,
          updateObject: {
            used: sequelize.literal('used + 1'),
          },
          query: {
            mt_id: template_id,
          },
        });
      }
    }

    return [`Message sent.`, null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while processing automated message: `, err);
    return [null, err.message];
  }
};

module.exports = processAutomatedMessage;
