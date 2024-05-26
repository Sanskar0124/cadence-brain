// Utils
const logger = require('../utils/winston');

// Models
const { Message_Template, Sub_Department } = require('../db/models');

// Helpers and Services
const JsonHelper = require('../helper/json');

const createMessageTemplate = async (template) => {
  try {
    const createdTemplate = await Message_Template.create(template);
    return [createdTemplate, null];
  } catch (err) {
    logger.error(`Error while creating message template: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getMessageTemplateById = async (mt_id, user_id) => {
  try {
    const template = await Message_Template.findAll({
      where: {
        mt_id,
        user_id,
      },
    });
    return [template, null];
  } catch (err) {
    logger.error(`Error while fetcing message template by id: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getAllMessageTemplates = async (user_id) => {
  try {
    const templates = await Message_Template.findAll({
      where: {
        user_id,
      },
    });
    return [templates, null];
  } catch (err) {
    logger.error(`Error while fetcing message templates: ${err.message}`);
    return [null, err];
  }
};

const updateMessageTemplate = async (template) => {
  try {
    const data = await Message_Template.update(template, {
      where: {
        mt_id: template.mt_id,
      },
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while updating message templates: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const deleteMessageTemplate = async (query) => {
  try {
    const data = await Message_Template.destroy({
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting message templates: ${err.message}`);
    return [null, err.message];
  }
};

const getAllMessageTemplatesByQuery = async (query) => {
  try {
    const templates = await Message_Template.findAll({
      where: query,
    });
    return [templates, null];
  } catch (err) {
    logger.error(
      `Error while fetching message templates by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getAllMessageTemplatesByQueryAndSdQuery = async (mt_query, sd_query) => {
  try {
    const templates = await Message_Template.findAll({
      where: mt_query,
      include: [
        { model: Sub_Department, where: sd_query, attributes: ['name'] },
      ],
    });
    return [JsonHelper.parse(templates), null];
  } catch (err) {
    logger.error(
      `Error while fetching message templates by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const MessageTemplateRepository = {
  createMessageTemplate,
  getMessageTemplateById,
  getAllMessageTemplates,
  updateMessageTemplate,
  deleteMessageTemplate,
  getAllMessageTemplatesByQuery,
  getAllMessageTemplatesByQueryAndSdQuery,
};

module.exports = MessageTemplateRepository;
