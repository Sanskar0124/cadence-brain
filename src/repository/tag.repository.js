// Utils
const logger = require('../utils/winston');

// Models
const { Tag } = require('../db/models');

const createTags = async (tags) => {
  try {
    const createdTags = await Tag.bulkCreate(tags);
    logger.info('Created Tags: ' + JSON.stringify(createdTags, null, 4));
    return [createdTags, null];
  } catch (err) {
    logger.error(`Error while creating tag: ${err.message}.`);
    return [null, err.message];
  }
};

const getTag = async (query) => {
  try {
    const tag = await Tag.findOne({
      where: query,
      raw: true,
    });

    return [tag, null];
  } catch (err) {
    logger.error(`Error while fetching tag: ${err.message}.`);
    return [null, err.message];
  }
};

const getTags = async (query) => {
  try {
    const tags = await Tag.findAll({
      where: query,
      raw: true,
    });

    return [tags, null];
  } catch (err) {
    logger.error(`Error while fetching tag: ${err.message}.`);
    return [null, err.message];
  }
};

const updateTag = async (query, tag) => {
  try {
    const data = await Tag.update(tag, {
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while updating tag: ${err.message}.`);
    return [null, err.message];
  }
};

const deleteTag = async (tag_id) => {
  try {
    const data = await Tag.destroy({
      where: {
        tag_id,
      },
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting tag: ${err.message}.`);
    return [null, err.message];
  }
};

const deleteTagsByQuery = async (query) => {
  try {
    const data = await Tag.destroy({
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting tag: ${err.message}.`);
    return [null, err.message];
  }
};

const TagRepository = {
  createTags,
  getTag,
  getTags,
  updateTag,
  deleteTag,
  deleteTagsByQuery,
};

module.exports = TagRepository;
