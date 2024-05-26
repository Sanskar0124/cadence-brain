// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { MAIL_INTEGRATION_TYPES } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Models
const { Attachment } = require('../../db/models');

// Helpers and Services
const sendMail = require('./sendMail');

// Repositories
const Repository = require('../../repository');

/**
 * @description Process scheduled mails
 * @param {object} task - Task to be executed
 * @param {object} user - User associated to task
 * @param {object} lead - Lead associated to task
 * @returns {msg: String, err: string}
 */
const processScheduledMail = async ({ task, user, lead }) => {
  try {
    // * Validation
    if (!task.metadata?.scheduled_mail) {
      logger.error(
        `No scheduled mail found in task.metadata for task_id : ${task.task_id}`
      );
      return [null, 'No scheduled mail found'];
    }

    // * Destructure task metadata
    let {
      subject,
      body,
      attachments,
      cc,
      bcc,
      to,
      from: from_email,
      et_id: email_template_id,
      ab_template_id,
    } = task.metadata.scheduled_mail;

    // * Lead Email check
    const [leadEmail, errLeadEmail] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD_EMAIL,
      query: {
        lead_id: lead.lead_id,
        email_id: to,
      },
    });
    if (errLeadEmail) return [null, errLeadEmail];
    if (!leadEmail) return [`Lead not associated with email`, null];

    // * Construct from
    const from = {
      user_id: user.user_id,
      addr: from_email,
    };

    // * Fetch google refresh token
    let [userToken, errFetchingUserToken] = await Repository.fetchOne({
      tableName: DB_TABLES.USER_TOKEN,
      query: {
        user_id: user.user_id,
      },
    });
    if (errFetchingUserToken) return [null, errFetchingUserToken];

    // * Fetch mail_integration_type
    const [companySettings, fetchErrorCompanySettings] =
      await Repository.fetchOne({
        tableName: DB_TABLES.COMPANY_SETTINGS,
        query: { company_id: user.company_id },
        extras: { attributes: ['mail_integration_type'] },
      });

    if (fetchErrorCompanySettings) {
      return [
        `Error in fetching company settings for user: ${user.user_id}`,
        null,
      ];
    }

    const token = {
      type: companySettings.mail_integration_type,
    };
    switch (token.type) {
      case MAIL_INTEGRATION_TYPES.GOOGLE:
        token.refresh_token = userToken.google_refresh_token;
        break;
      case MAIL_INTEGRATION_TYPES.OUTLOOK:
        token.refresh_token = userToken.outlook_refresh_token;
        break;
    }
    logger.info(JSON.stringify(token, null, 4));
    let attachmentList = attachments;
    if (attachments?.length > 0 && typeof attachments?.[0] === 'number') {
      // * Retrieving required attachments
      attachmentList = await Repository.fetchAll({
        tableName: DB_TABLES.ATTACHMENT,
        query: {
          attachment_id: {
            [Op.in]: attachments,
          },
        },
      });
    }
    // * structuring attachments
    let requiredAttachments = attachmentList?.map((attachment) => ({
      original_name: attachment?.original_name,
      attachment_url: attachment?.attachment_url,
      attachment_id: attachment?.attachment_id,
    }));
    const [_, errForMailSent] = await sendMail({
      mailToSend: {
        token,
        to,
        cc,
        bcc,
        from,
        subject,
        body,
        lead,
        attachments: requiredAttachments,
        cadence_id: task.cadence_id,
        node_id: task.node_id,
        email_template_id,
        ab_template_id,
      },
      salesPerson: user,
      task,
      lead,
    });

    if (errForMailSent) return [null, errForMailSent];

    return ['Processed successfully', null];
  } catch (err) {
    logger.error(`Error while handling scheduled mail: `, err);
    return [null, err.message];
  }
};

module.exports = processScheduledMail;
