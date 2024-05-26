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

const processAutomatedReply = async ({
  task,
  salesPerson,
  lead,
  node,
  emailSetting,
  toWait,
}) => {
  try {
    // * Fetch a random number for selecting mail

    // * retreive required data from node
    let {
      subject,
      body,
      attachments,
      cc,
      bcc,
      et_id: email_template_id,
      aBTestEnabled,
      templates,
      replied_node_id,
    } = node.data; // * use random mail

    if (!replied_node_id) return [`Replied node id not sent.`, null];

    let ab_template_id = null;

    if (aBTestEnabled) {
      // choose a template from templates and use it
      const [template, errForTemplate] = await chooseTemplate(templates);
      if (errForTemplate) {
        logger.error(`Error while choosing template`, errForTemplate);
        return [`Error while choosing template.`, null];
      }

      if (!errForTemplate && template) {
        subject = template.subject ?? subject;
        body = template.body ?? body;
        attachments = template.attachments;
        et_id = template?.et_id ?? email_template_id;
        ab_template_id = template.ab_template_id;
      }
    }

    const [leadEmail, errForLeadEmail] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD_EMAIL,
      query: {
        lead_id: lead.lead_id,
        is_primary: 1,
      },
    });
    if (errForLeadEmail) {
      logger.error(
        `Error while fetching lead primary email: `,
        errForLeadEmail
      );
      return [`Primary mail not found for lead.`, null];
    }

    if (!leadEmail) return [`Primary mail not found for lead.`, null];

    let leadPrimaryEmail = leadEmail?.email_id;

    if (!leadPrimaryEmail) return [`Primary mail not found for lead.`, null];

    // * composing to field from lead details
    const to = leadPrimaryEmail;

    // * composing from field from sales person details
    if (!salesPerson.primary_email)
      return [
        'Primary email not present for user. Please sign in with any mail service to continue.',
        null,
      ];

    const from = {
      // name: salesPerson.first_name,
      user_id: salesPerson.user_id,
      addr: salesPerson.primary_email,
    };
    // console.log(to, from);
    // console.log({
    //   subject,
    //   body,
    //   attachments: attachmentsIds,
    //   linkText,
    //   redirectUrl,
    // });

    // * sales person's google_refresh_token

    let [userToken, errForUserToken] = await Repository.fetchOne({
      tableName: DB_TABLES.USER_TOKEN,
      query: {
        user_id: salesPerson.user_id,
      },
    });
    if (errForUserToken) {
      logger.error(`Error while fetching user token: `, errForUserToken);
      return [
        `Error while fetching user token for user: ${salesPerson.user_id}`,
        ,
        null,
      ];
    }

    //Fetch mail_integration_type
    const [companySettings, fetchErrorCompanySettings] =
      await Repository.fetchOne({
        tableName: DB_TABLES.COMPANY_SETTINGS,
        query: { company_id: salesPerson.company_id },
        extras: { attributes: ['mail_integration_type'] },
      });
    if (fetchErrorCompanySettings)
      return [
        `Error in fetching company settings for user: ${salesPerson.user_id}`,
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
      // * retreiving required attachments
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
    requiredAttachments = JSON.parse(JSON.stringify(requiredAttachments));
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
      salesPerson,
      task,
      node,
      lead,
    });

    if (errForMailSent) return [null, errForMailSent];

    return ['Processed successfully', null];
  } catch (err) {
    logger.error(`Error while handling automated reply: `, err);
    return [null, err.message];
  }
};

module.exports = processAutomatedReply;
