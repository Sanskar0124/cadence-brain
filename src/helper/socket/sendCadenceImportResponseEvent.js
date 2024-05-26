// Utils
const logger = require('../../utils/winston');

const client = require('./setup');

const sendCadenceImportResponseEvent = async ({ response_data, socketId }) => {
  try {
    let data = await client.sendCadenceImportResponseEvent({
      socket_id: socketId,
      response_data: JSON.stringify(response_data),
    });

    if (data.success) return [data.msg, null];
    else return [null, data.msg];
  } catch (err) {
    logger.error(
      'Error while sending cadence import response event to socket service via grpc: ',
      err
    );
    console.log('Stack trace sendCadenceImportResponseEvent.js ', err);
    return [null, err.message];
  }
};

module.exports = sendCadenceImportResponseEvent;
