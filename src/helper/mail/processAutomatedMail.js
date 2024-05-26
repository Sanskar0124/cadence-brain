// Utils
const logger = require('../../utils/winston');
const RandomHelper = require('../random');
const { DB_TABLES } = require('../../utils/modelEnums');
const { MAIL_INTEGRATION_TYPES } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Models
const { User_Token, Attachment, Lead_email } = require('../../db/models');

// Helpers and Services
const chooseTemplate = require('../abTesting/chooseTemplate');
const sendMail = require('./sendMail');

// Repositories
const Repository = require('../../repository');
const JsonHelper = require('../json');

const processAutomatedMail = async ({
  task,
  salesPerson,
  lead,
  node,
  emailSetting,
  toWait,
}) => {
  try {
    // * retreive required data from node
    let {
      subject,
      body,
      attachments,
      linkText,
      redirectUrl,
      cc,
      bcc,
      et_id: email_template_id,
      aBTestEnabled,
      templates,
    } = node.data; // * use random mail

    let ab_template_id = null;

    if (aBTestEnabled) {
      // choose a template from templates and use it
      const [template, errForTemplate] = await chooseTemplate(templates);
      if (errForTemplate)
        logger.error(`Error while choosing template`, errForTemplate);

      if (!errForTemplate && template) {
        subject = template.subject ?? subject;
        body = template.body ?? body;
        attachments = template?.attachments;
        et_id = template?.et_id ?? email_template_id;
        ab_template_id = template.ab_template_id;
      }
    }

    const leadEmail = await Lead_email.findOne({
      where: {
        lead_id: lead.lead_id,
        is_primary: 1,
      },
    });

    if (!leadEmail) return [`Primary mail not found for lead.`, null];

    let leadPrimaryEmail = leadEmail?.email_id;

    if (!leadPrimaryEmail) return [`Primary mail not found for lead.`, null];

    // * composing to field from lead details
    const to = leadPrimaryEmail;

    // * composing from field from sales person details
    if (!salesPerson.primary_email) {
      return [
        'Primary email not present for user. Please sign in with any mail service to continue.',
        null,
      ];
    }

    const from = {
      // name: salesPerson.first_name,
      user_id: salesPerson.user_id,
      addr: salesPerson.primary_email,
    };

    // * sales person's google_refresh_token
    let userToken = await User_Token.findOne({
      where: {
        user_id: salesPerson.user_id,
      },
    });

    userToken = JsonHelper.parse(userToken);

    //Fetch mail_integration_type
    const [companySettings, fetchErrorCompanySettings] =
      await Repository.fetchOne({
        tableName: DB_TABLES.COMPANY_SETTINGS,
        query: { company_id: salesPerson.company_id },
        extras: { attributes: ['mail_integration_type'] },
      });

    if (fetchErrorCompanySettings) {
      return [
        `Error in fetching company settings for user: ${salesPerson.user_id}`,
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
      // * retreiving required attachments
      attachmentList = await Attachment.findAll({
        where: {
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
    requiredAttachments = JSON.parse(JSON.stringify(requiredAttachments));
    const [mailSent, errForMailSent] = await sendMail({
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
      salesPerson,
      task,
      node,
      lead,
    });

    if (errForMailSent) return [null, errForMailSent];

    return ['Processed successfully', null];
  } catch (err) {
    logger.error(`Error while handling automated mail: `, err);
    return [null, err.message];
  }
};

module.exports = processAutomatedMail;
