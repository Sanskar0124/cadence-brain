// * Utils
const {
  AUTOMATED_WORKFLOW_FILTER_EQUATORS,
  MODEL_TYPES,
} = require('../../../utils/enums');
const logger = require('../../../utils/winston');

const filterDate = ({
  objects,
  model_type,
  integration_field,
  equator,
  value,
  id,
}) => {
  try {
    let data = null;

    // * Logic to decide which object to use
    switch (model_type) {
      case MODEL_TYPES.ACCOUNT:
        data = objects.account;
        break;
      case MODEL_TYPES.LEAD:
        data = objects.lead;
        break;
      case MODEL_TYPES.USER:
        data = objects.user;
        break;
      default:
        return { id, status: 0 };
    }

    // * Data is not present
    if (!data) return { id, status: 0 };

    let timestamp = new Date(data[integration_field]);

    switch (equator) {
      case AUTOMATED_WORKFLOW_FILTER_EQUATORS.GREATER_THAN:
        if (timestamp.getTime() > value) {
          // console.log(
          //   '[SUCCESS] :  DATE IS GREATER THAN TARGET | Id: ' +
          //     id
          // );
          return { id, status: 1 };
        }
        break;
      case AUTOMATED_WORKFLOW_FILTER_EQUATORS.LESS_THAN:
        if (timestamp.getTime() < value) {
          // console.log(
          //   '[SUCCESS] : DATE IS LESS THAN TARGET | Id: ' + id
          // );
          return { id, status: 1 };
        }
        break;
      case AUTOMATED_WORKFLOW_FILTER_EQUATORS.EQUAL:
        let targetDate = new Date(value);
        if (
          timestamp.getUTCFullYear() === targetDate.getUTCFullYear() &&
          timestamp.getUTCMonth() === targetDate.getUTCMonth() &&
          timestamp.getUTCDate() === targetDate.getUTCDate()
        ) {
          // console.log(
          //   '[SUCCESS] : DATE IS EQUAL TO TARGET | Id: ' + id
          // );
          return { id, status: 1 };
        }
        break;
    }

    // console.log('[FAILURE] DATE IS NOT A MATCH | Id: ' + id);
    return { id, status: 0 };
  } catch (err) {
    logger.error(`An error occurred while filtering using date `, err);
    return { id, status: 0 };
  }
};

module.exports = filterDate;
