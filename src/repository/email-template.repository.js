// Utils
const logger = require('../utils/winston');

// Models
const {
  Email_Template,
  Attachment,
  Email,
  Sub_Department,
  sequelize,
} = require('../db/models');

// Helpers and Services
const JsonHelper = require('../helper/json');

const createEmailTemplate = async (template) => {
  try {
    const createdTemplate = await Email_Template.create(template);
    return [createdTemplate, null];
  } catch (err) {
    logger.error('Error while creating email template: ', err);
    return [null, err.message]; // for database error
  }
};

/**
 * Statistics to include
 * 1. Total Emails Opened
 * 2. Total Emails Clicked = Clicked + Opened
 * 3. Total Emails Not Opened = Delivered Status (Unseen)
 * 4. Total Emails Bounced
 * 5.
 */
const getAllEmailTemplatesByQuery = async (query) => {
  try {
    const templates = await Email_Template.findAll({
      where: query,
      attributes: [
        [
          sequelize.literal(`
            SUM(
              CASE 
                WHEN Emails.status = 'opened' and sent=true THEN 1
                WHEN Emails.status = 'clicked' and sent=true THEN 1
                WHEN Emails.status = 'delivered' and sent=true THEN 1
                ELSE 0
              END
            )
          `),
          'unseen',
        ],
        [
          sequelize.literal(`
            SUM(
              CASE WHEN Emails.status = 'clicked' and sent=true THEN 1 ELSE 0 END
            )
          `),
          'clicked',
        ],
        [
          sequelize.literal(`
            SUM(
              CASE 
                WHEN Emails.status = 'bounced' and sent=true THEN 1
                ELSE 0
              END
            )
          `),
          'bounced',
        ],
        [
          sequelize.literal(`
            SUM(
              CASE 
                WHEN Emails.status = 'opened' and sent=true THEN 1
                WHEN Emails.status = 'clicked' and sent=true THEN 1
                ELSE 0
              END
            )
          `),
          'opened',
        ],
        [
          sequelize.literal(`
            SUM(
              CASE 
                WHEN Emails.sent = false THEN 1
                ELSE 0
              END
            )
          `),
          'replied',
        ],

        [
          sequelize.literal(`
            SUM(
              CASE 
                WHEN Emails.unsubscribed = true THEN 1
                ELSE 0
              END
            )
          `),
          'unsubscribed',
        ],
        'body',
        'created_at',
        'level',
        'linkText',
        'name',
        'redirectUrl',
        'sd_id',
        'subject',
        'user_id',
      ],
      include: [
        {
          model: Email,
          as: 'Emails',
          attributes: [],
        },
        {
          model: Attachment,
          alias: 'Attachments',
          separate: true,
        },
      ],
      group: ['et_id'],
      order: [['created_at', 'DESC']],
    });
    return [JsonHelper.parse(templates), null];
  } catch (err) {
    logger.error(err.message);
    return [null, err];
  }
};

const getAllEmailTemplatesByQueryAndSdQuery = async (et_query, sd_query) => {
  try {
    const templates = await Email_Template.findAll({
      where: et_query,
      attributes: [
        [
          sequelize.literal(`
            SUM(
              CASE 
                WHEN Emails.status = 'opened' and sent=true THEN 1
                WHEN Emails.status = 'clicked' and sent=true THEN 1
                WHEN Emails.status = 'delivered' and sent=true THEN 1
                ELSE 0
              END
            )
          `),
          'unseen',
        ],
        [
          sequelize.literal(`
            SUM(
              CASE WHEN Emails.status = 'clicked' and sent=true THEN 1 ELSE 0 END
            )
          `),
          'clicked',
        ],
        [
          sequelize.literal(`
            SUM(
              CASE 
                WHEN Emails.status = 'bounced' and sent=true THEN 1
                ELSE 0
              END
            )
          `),
          'bounced',
        ],
        [
          sequelize.literal(`
            SUM(
              CASE 
                WHEN Emails.status = 'opened' and sent=true THEN 1
                WHEN Emails.status = 'clicked' and sent=true THEN 1
                ELSE 0
              END
            )
          `),
          'opened',
        ],
        [
          sequelize.literal(`
            SUM(
              CASE 
                WHEN Emails.sent = false THEN 1
                ELSE 0
              END
            )
          `),
          'replied',
        ],

        [
          sequelize.literal(`
            SUM(
              CASE 
                WHEN Emails.unsubscribed = true THEN 1
                ELSE 0
              END
            )
          `),
          'unsubscribed',
        ],
        'body',
        'created_at',
        'level',
        'linkText',
        'name',
        'redirectUrl',
        'sd_id',
        'subject',
        'user_id',
      ],
      include: [
        {
          model: Email,
          as: 'Emails',
          attributes: [],
        },
        {
          model: Attachment,
          alias: 'Attachments',
          separate: true,
        },
        {
          model: Sub_Department,
          where: sd_query,
          attributes: ['name'],
        },
      ],
      group: ['et_id'],
      order: [['created_at', 'DESC']],
    });
    return [JsonHelper.parse(templates), null];
  } catch (err) {
    logger.error(
      'Error while fetching email templates by query and sd query: ',
      err
    );
    return [null, err.message];
  }
};

const updateEmailTemplate = async (template) => {
  try {
    const data = await Email_Template.update(template, {
      where: {
        et_id: template.et_id,
      },
    });
    return [JsonHelper.parse(data), null];
  } catch (err) {
    logger.error('Error while updating email template: ', err);
    return [null, err.message]; // for database error
  }
};

const deleteEmailTemplate = async (query) => {
  try {
    const data = await Email_Template.destroy({
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error('Error while deleting email template: ', err);
    return [null, err];
  }
};

const EmailTemplateRepository = {
  createEmailTemplate,
  getAllEmailTemplatesByQuery,
  getAllEmailTemplatesByQueryAndSdQuery,
  updateEmailTemplate,
  deleteEmailTemplate,
};

module.exports = EmailTemplateRepository;
