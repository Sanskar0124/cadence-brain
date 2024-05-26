// Utils
const logger = require('../../utils/winston');
const { ACTIVITY_TYPE } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

const { activityCreation } = require('./activityCreation');

// Repositories
const Repository = require('../../repository/');

const createAndSendOutOfOfficeActivity = async ({
  user,
  lead,
  sent_mail,
  replied_mail,
  cadence_id,
}) => {
  try {
    const [activityExists, errActivityExists] = await Repository.fetchOne({
      tableName: DB_TABLES.ACTIVITY,
      query: { message_id: replied_mail.id },
    });
    if (errActivityExists) return [null, errActivityExists];

    if (!activityExists) {
      const activity = {
        message_id: replied_mail.id,
        sent_message_id: sent_mail.id,
        name: `${lead.first_name} ${lead.last_name} is Out of Office`,
        type: ACTIVITY_TYPE.OUT_OF_OFFICE,
        status: `Subject: ${replied_mail.headers.subject}`,
        lead_id: lead.lead_id,
        incoming: true,
        created_at: replied_mail.internalDate,
        cadence_id: cadence_id ? cadence_id : null,
      };

      const [createdActivity, err] = await activityCreation(
        activity,
        user.user_id
      );
      if (err === 'duplicate') return [true, null];
      if (err) return [null, err];

      return [createdActivity, null];
    } else {
      logger.error(`Activity already exists`);
      return [null, `Activity already exists.`];
    }
  } catch (err) {
    logger.error(`Error while trying to create an activity: `, err);
    return [null, err.message];
  }
};

module.exports = createAndSendOutOfOfficeActivity;
