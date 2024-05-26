// Utils
const logger = require('../utils/winston');

// Models
const { Linkedin_Template, Sub_Department } = require('../db/models');

// Helpers and Services
const JsonHelper = require('../helper/json');

const createLinkedinTemplate = async (template) => {
  try {
    const createdTemplate = await Linkedin_Template.create(template);
    return [createdTemplate, null];
  } catch (err) {
    logger.error(`Error while creating linkedin template: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const updateLinkedinTemplate = async (template) => {
  try {
    const data = await Linkedin_Template.update(template, {
      where: {
        lt_id: template.lt_id,
      },
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while updating linkedin template: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const deleteLinkedinTemplate = async (query) => {
  try {
    const data = await Linkedin_Template.destroy({
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting linkedin template: ${err.message}`);
    return [null, err.message];
  }
};

const getAllLinkedinTemplatesByQuery = async (query) => {
  try {
    const templates = await Linkedin_Template.findAll({
      where: query,
    });
    return [JsonHelper.parse(templates), null];
  } catch (err) {
    logger.error(
      `Error while fecthing linkedin templates by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getAllLinkedinTemplatesByQueryAndSdQuery = async (lt_query, sd_query) => {
  try {
    const templates = await Linkedin_Template.findAll({
      where: lt_query,
      include: [
        {
          model: Sub_Department,
          where: sd_query,
          attributes: ['name'],
        },
      ],
    });
    return [JsonHelper.parse(templates), null];
  } catch (err) {
    logger.error(
      `Error while fecthing linkedin templates by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const LinkedinTemplateRepository = {
  createLinkedinTemplate,
  updateLinkedinTemplate,
  deleteLinkedinTemplate,
  getAllLinkedinTemplatesByQuery,
  getAllLinkedinTemplatesByQueryAndSdQuery,
};

module.exports = LinkedinTemplateRepository;
