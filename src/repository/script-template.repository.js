// Utils
const logger = require('../utils/winston');

// Models
const { Script_Template } = require('../db/models');

// Services and Helpers
const JsonHelper = require('../helper/json');

const createScriptTemplate = async (template) => {
  try {
    const createdTemplate = await Script_Template.create(template);
    return [createdTemplate, null];
  } catch (err) {
    logger.error(`Error while creating script template: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const updateScriptTemplate = async (template) => {
  try {
    const data = await Script_Template.update(template, {
      where: {
        st_id: template.st_id,
      },
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while updating script template: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const deleteScriptTemplate = async (query) => {
  try {
    const data = await Script_Template.destroy({
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting script template: ${err.message}`);
    return [null, err.message];
  }
};

const getScriptTemplatesByQuery = async (query) => {
  try {
    const templates = await Script_Template.findAll({
      where: query,
    });
    return [JsonHelper.parse(templates), null];
  } catch (err) {
    logger.error(
      `Error while fetching script template by query: ${err.message}`
    );
    return [null, err.message];
  }
};

const getScriptTemplatesByQueryAndSdQuery = async (st_query, sd_query) => {
  try {
    const templates = await Script_Template.findAll({
      where: st_query,
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
      `Error while fetching script template by query: ${err.message}`
    );
    return [null, err.message];
  }
};

const ScriptTemplateRepository = {
  createScriptTemplate,
  updateScriptTemplate,
  deleteScriptTemplate,
  getScriptTemplatesByQuery,
  getScriptTemplatesByQueryAndSdQuery,
};

module.exports = ScriptTemplateRepository;
