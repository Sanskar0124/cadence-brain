// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { TEMPLATE_LEVEL } = require('../../utils/enums');

// Repository
const Repository = require('../../repository');

/**
 creates a default templates for a user
  @param {string} user_id id of the user for whom cadence needs to be created 
  @param t sequelize.transaction
 */
const createDefaultTemplates = async ({ user_id, t }) => {
  try {
    const email_template = {
      name: 'Intro to Cadence',
      level: TEMPLATE_LEVEL.PERSONAL,
      subject: 'Revolutionize Your Sales Process with Cadence',
      body: '<p class="p1">Dear {{first_name}},</p><p class="p1">&nbsp;</p><p class="p1">Are you tired of using outdated sales prospecting tools that don\'t deliver results? It\'s time to revolutionize your sales process with Cadence. Our new multichannel sales prospecting tool automates your sales activities, making your sales team twice as efficient.&nbsp;</p><p class="p1">&nbsp;</p><p class="p1"><strong>Can you imagine… emails, social media messages, even calls… automated for every lead? How much time could that save you? Our users say anywhere from 4 to 6 hours a week, minimum!</strong></p><p class="p1">&nbsp;</p><p class="p1">Want to see how it works? Check out this video: https://youtu.be/q3NWJLvOVJQ</p><p class="p1">&nbsp;</p><p class="p1">If you\'re ready to take your sales process to the next level, let\'s schedule a call to discuss how Cadence can help you achieve your sales goals.</p><p class="p1">&nbsp;</p><p class="p1">Best regards,</p><p class="p1">&nbsp;</p><p class="p1">{{sender_first_name}}</p>',
      user_id,
    };
    const [data, err] = await Repository.create({
      tableName: DB_TABLES.EMAIL_TEMPLATE,
      createObject: email_template,
      t,
    });
    if (err) return [null, err];

    logger.info(`Created email_template successfully`);

    const script_template = {
      name: 'Intro to Cadence',
      level: TEMPLATE_LEVEL.PERSONAL,
      script: `Hi, this is {{first_name}}. How are you today?

      …
      
      Great to hear!
      
      I noticed you received our email about Cadence, the multichannel sales prospecting tool. Did you have a chance to take a look at the video we shared?
      
      …
      
      That's fantastic to hear! We believe Cadence can truly revolutionize your sales process and save you a significant amount of time.
      
      How are you currently organizing your sales prospecting?`,
      user_id,
    };

    const [scriptTemplate, errForScriptTemplate] = await Repository.create({
      tableName: DB_TABLES.SCRIPT_TEMPLATE,
      createObject: script_template,
      t,
    });
    if (errForScriptTemplate) return [null, errForScriptTemplate];

    logger.info(`Created script_template successfully`);

    return [data, null];
  } catch (err) {
    logger.error(`Error while creating default templates: `, err);
    return [null, err.message];
  }
};

module.exports = createDefaultTemplates;
