// Utils
const logger = require('../../utils/winston');
const { ACTIVITY_TYPE, ACTIVITY_SUBTYPES } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const Repository = require('../../repository');

// Helper and Services
const SocketHelper = require('../socket');
const { activityCreation } = require('./activityCreation');
const getActivityFromTemplates = require('./getActivityFromTemplates');
const logMailActivity = require('./logMailActivity');

const createAndSendMailActivity = async ({
  user,
  lead,
  mail,
  sent,
  cadence_id,
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
          type: ACTIVITY_TYPE.MAIL,
          sub_type: sent ? ACTIVITY_SUBTYPES.SENT : ACTIVITY_SUBTYPES.RECEIVED,
          variables: {
            lead_first_name: lead.first_name,
            lead_last_name: lead.last_name,
            mail_subject: mail.subject ?? 'No Subject',
          },
          activity: {
            message_id: mail.id,
            lead_id: lead.lead_id,
            incoming: sent ? false : true,
            created_at: mail.createdAt,
            cadence_id: cadence_id ? cadence_id : null,
            node_id: node_id ?? null,
          },
        });

      const [createdActivity, err] = await activityCreation(
        activityFromTemplate,
        user.user_id
      );
      if (err === 'duplicate') return [true, null];
      if (err) return [null, err];

      // TODO : import sendNotification
      if (!sent) {
        SocketHelper.sendNotification({
          type: ACTIVITY_TYPE.MAIL,
          user_id: user.user_id,
          lead_id: lead.lead_id,
          title: `Received email`,
          message_id: mail.id,
          lead_first_name: lead.first_name,
          lead_last_name: lead.last_name,
        });
      }

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
          sent,
          access_token,
          instance_url,
          integration_type,
          company_setting,
        });
      }

      return [createdActivity, null];
    } else {
      //return [true, null];
      return [null, 'Activity already exists.'];
    }
  } catch (err) {
    logger.error(`Error while trying to create an activity: `, err);
    return [null, err.message];
  }
};

module.exports = createAndSendMailActivity;
