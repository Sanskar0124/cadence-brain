const logger = require('./winston');
const { ResponseStatus } = require('./response');

const grpcResponseHandler = (response) => {
  try {
    switch (response.status) {
      case ResponseStatus.SUCCESS:
      case ResponseStatus.CREATED: {
        return [response.data, null];
      }
      case ResponseStatus.BAD_REQUEST:
      case ResponseStatus.UNAUTHORIZED:
      case ResponseStatus.FORBIDDEN:
      case ResponseStatus.NOT_FOUND: {
      }
      case ResponseStatus.INTERNAL_ERROR: {
      }
    }
  } catch (err) {
    logger.error('Error while handling grpc response handler: ', err);
    return [null, err.message];
  }
};

module.exports = grpcResponseHandler;
