// Utils
const logger = require('../../utils/winston');
const { ACTIVITY_TYPE, ACTIVITY_SUBTYPES } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const Repository = require('../../repository');

// Repositories
const { activityCreation } = require('./activityCreation');
const getActivityFromTemplates = require('./getActivityFromTemplates');
const logMailActivity = require('./logMailActivity');

const createAndSendReplyActivity = async ({
  user,
  lead,
  mail,
  cadence_id,
  incoming,
  node_id,
  access_token,
  instance_url,
  integration_type,
  company_setting,
}) => {
  try {
    const [activityExists, errActivityExists] = await Repository.fetchOne({
      tableName: DB_TABLES.ACTIVITY,
      query: { message_id: mail.id },
    });
    if (errActivityExists) return [null, errActivityExists];

    if (!activityExists) {
      const [activityFromTemplate, errForActivityFromTemplate] =
        getActivityFromTemplates({
          type: ACTIVITY_TYPE.REPLY_TO,
          sub_type: incoming
            ? ACTIVITY_SUBTYPES.RECEIVED
            : ACTIVITY_SUBTYPES.SENT,
          variables: {
            lead_first_name: lead.first_name,
            lead_last_name: lead.last_name,
            mail_subject: mail.subject ?? 'No Subject',
          },
          activity: {
            message_id: mail.id,
            lead_id: lead.lead_id,
            incoming: incoming,
            created_at: mail.createdAt,
            cadence_id: cadence_id ? cadence_id : null,
          },
        });

      const [createdActivity, err] = await activityCreation(
        activityFromTemplate,
        user.user_id
      );
      if (err === 'duplicate') return [true, null];
      if (err) return [null, err];

      if (
        createdActivity &&
        access_token &&
        (user.integration_id || user.salesforce_owner_id) &&
        (lead.integration_id ||
          lead.salesforce_lead_id ||
          lead.salesforce_contact_id)
      ) {
        await logMailActivity({
          user,
          lead,
          mail,
          incoming,
          access_token,
          instance_url,
          integration_type,
          company_setting,
        });
      }

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

module.exports = createAndSendReplyActivity;
