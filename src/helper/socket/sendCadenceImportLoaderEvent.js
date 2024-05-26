// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

const client = require('./setup');

const Repository = require('../../repository');

const sendCadenceImportLoaderEvent = async ({ loaderData, socketId }) => {
  try {
    let data = await client.sendCadenceImportLoaderEvent({
      socket_id: socketId,
      loader_data: JSON.stringify(loaderData),
    });

    if (data.success) return [data.msg, null];
    else return [null, data.msg];
  } catch (err) {
    logger.error(
      'Error while sending cadence import loader event to socket service via grpc: ',
      err
    );
    console.log('Stack trace sendCadenceImportLoaderEvent.js ', err);
    return [null, err.message];
  }
};

module.exports = sendCadenceImportLoaderEvent;
