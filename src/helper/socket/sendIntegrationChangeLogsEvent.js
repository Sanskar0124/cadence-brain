// Utils
const logger = require('../../utils/winston');

// Helpers
const client = require('./setup');

const sendIntegrationChangeLogsEvent = async ({ logs, email }) => {
  try {
    let data = await client.sendIntegrationChangeLogsEvent({
      email,
      logs: JSON.stringify(logs),
    });

    if (data.success) return [data.msg, null];
    else return [null, data.msg];
  } catch (err) {
    logger.error(
      'Error while sending integration change logs event to socket service via grpc: ',
      err
    );
    console.log('Stack trace sendIntegrationChangeLogsEvent.js ', err);
    return [null, err.message];
  }
};

module.exports = sendIntegrationChangeLogsEvent;
