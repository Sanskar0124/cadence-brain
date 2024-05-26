// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { MAIL_INTEGRATION_TYPES } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');
const { Attachment } = require('../../db/models');

// Helpers and Services
const JsonHelper = require('../json');
const chooseTemplate = require('../abTesting/chooseTemplate');
const sendReply = require('./sendReply');

/**
 * @description Process scheduled mails
 * @param {object} task - Task to be executed
 * @param {object} user - User associated to task
 * @param {object} lead - Lead associated to task
 * @param {object} node - Node associated to task
 * @returns {msg: String, err: string}
 */
const processScheduledReply = async ({ task, user, lead, node }) => {
  try {
    // * Validation
    if (!task.metadata?.scheduled_mail) {
      logger.error(
        `No scheduled reply mail found in task.metadata for task_id : ${task.task_id}`
      );
      return [null, 'No scheduled reply found'];
    }

    // * Destructure task metadata
    let {
      subject,
      body,
      attachments,
      cc,
      bcc,
      et_id: email_template_id,
      ab_template_id,
      to,
    } = task.metadata.scheduled_mail;

    let replied_node_id = node?.data?.replied_node_id;
    if (!replied_node_id) return [`Replied node id not sent.`, null];

    // * Lead Email check
    const [leadEmail, errFetchingLeadEmail] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD_EMAIL,
      query: {
        lead_id: lead.lead_id,
        email_id: to,
      },
      extras: {
        attributes: ['lem_id'],
      },
    });
    if (errFetchingLeadEmail) return [null, errFetchingLeadEmail];
    if (!leadEmail) return [`Lead not associated with email`, null];

    // * composing from field from sales person details
    if (!user.primary_email)
      return [
        'Primary email not present for user. Please sign in with any mail service to continue.',
        null,
      ];

    // * Construct from
    const from = {
      // name: salesPerson.first_name,
      user_id: user.user_id,
      addr: user.primary_email,
    };

    // * Fetch google refresh token
    let [userToken, errForUserToken] = await Repository.fetchOne({
      tableName: DB_TABLES.USER_TOKEN,
      query: {
        user_id: user.user_id,
      },
    });
    if (errForUserToken) {
      logger.error(`Error while fetching user token: `, errForUserToken);
      return [
        `Error while fetching user token for user: ${user.user_id}`,
        ,
        null,
      ];
    }

    // * Fetch mail_integration_type
    const [companySettings, fetchErrorCompanySettings] =
      await Repository.fetchOne({
        tableName: DB_TABLES.COMPANY_SETTINGS,
        query: { company_id: user.company_id },
        extras: { attributes: ['mail_integration_type'] },
      });
    if (fetchErrorCompanySettings)
      return [
        `Error in fetching company settings for user: ${user.user_id}`,
        null,
      ];

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
    let errForAttachmentList;
    if (attachments?.length > 0 && typeof attachments?.[0] === 'number') {
      // * Retrieving required attachments
      [attachmentList, errForAttachmentList] = await Repository.fetchAll({
        tableName: DB_TABLES.ATTACHMENT,
        query: {
          attachment_id: {
            [Op.in]: attachments,
          },
        },
      });
      if (errForAttachmentList) {
        logger.error('Sending email without attachments');
        attachmentList = [];
      }
    }
    // * structuring attachments
    let requiredAttachments = attachmentList?.map((attachment) => ({
      original_name: attachment?.original_name,
      attachment_url: attachment?.attachment_url,
      attachment_id: attachment?.attachment_id,
    }));
    const [mailSent, errForMailSent] = await sendReply({
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
        replied_node_id,
      },
      salesPerson: user,
      task,
      node,
      lead,
    });

    if (errForMailSent) return [null, errForMailSent];

    return ['Processed successfully', null];
  } catch (err) {
    logger.error(`Error while handling scheduled reply: `, err);
    return [null, err.message];
  }
};

module.exports = processScheduledReply;
