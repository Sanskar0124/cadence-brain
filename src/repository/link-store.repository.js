// Utils
const logger = require('../utils/winston');

// Models
const { LinkStore } = require('../db/models');

const get = async (url) => {
  try {
    const data = await LinkStore.findOne({
      where: {
        url,
      },
    });
    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(`Error while fetching link store: ${err.message}`);
    return [null, err.message];
  }
};

const createShortenedLink = async (recordObj) => {
  try {
    var count = await LinkStore.count();
    recordObj.url = recordObj.url + '-' + String(count + 1);
    logger.info(recordObj);

    var record = recordObj;
    // create record
    await LinkStore.create(record);
    return [recordObj.url, null];
  } catch (err) {
    logger.error(`Error while creating link store: ${err.message}`);
    return [null, err.message];
  }
};

const updateRecord = async (query, record) => {
  try {
    var data = await LinkStore.update(record, {
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while updating link store: ${err.message}`);
    return [null, err.message];
  }
};

// * Fetch count of link store
const getCountOfLinkStore = async () => {
  try {
    let count = await LinkStore.count();
    return [count, null];
  } catch (err) {
    logger.error(`Error while fetching count from link store: ${err.message}`);
    return [null, err.message];
  }
};

// * increment a record
const increment = async (query, incrementObj) => {
  try {
    await LinkStore.increment(incrementObj, { where: query });
    return [true, null];
  } catch (err) {
    logger.error(
      `Error while fetching count from link store: ${err.message}`,
      err
    );
    return [null, err.message];
  }
};

// * Create a new custom tracking link
const createCustomLinkURLMapping = async (customLinkMapping) => {
  try {
    await LinkStore.create(customLinkMapping);
    return [true, null];
  } catch (e) {
    logger.error(
      `Error while creating custom link mapping in link store: ${err.message}`
    );
    return [null, err.message];
  }
};

const LinkStoreRepository = {
  get,
  createShortenedLink,
  updateRecord,
  getCountOfLinkStore,
  increment,
  createCustomLinkURLMapping,
};

module.exports = LinkStoreRepository;
