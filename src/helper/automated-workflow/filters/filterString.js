// * Utils
const {
  AUTOMATED_WORKFLOW_FILTER_EQUATORS,
  MODEL_TYPES,
} = require('../../../utils/enums');
const logger = require('../../../utils/winston');

const filterString = ({
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
        console.log('[FAILURE] No Model found | Id: ' + id);
        return { id, status: 0 };
    }

    // * Data is not present
    if (!data) return { id, status: 0 };

    console.log(`[DEBUG] :  Branch id: (${id})`);

    switch (equator) {
      case AUTOMATED_WORKFLOW_FILTER_EQUATORS.EQUAL:
        if (
          data[integration_field].toString().trim() === value.toString().trim()
        ) {
          // console.log('[SUCCESS] : STRING IS EQUAL | Id: ' + id);
          return { id, status: 1 };
        }
        break;
      case AUTOMATED_WORKFLOW_FILTER_EQUATORS.INCLUDES:
        if (
          data[integration_field]
            .toString()
            .trim()
            .includes(value.toString().trim())
        ) {
          // console.log(
          //   '[SUCCESS] : STRING INCLUDES TARGET | Id: ' + id
          // );
          return { id, status: 1 };
        }
        break;
    }

    console.log('[FAILURE] STRING IS NOT A MATCH | Id: ' + id);
    return { id, status: 0 };
  } catch (err) {
    logger.error(`An error occurred while filtering using string: ${id} `, err);
    return { id, status: 0 };
  }
};

module.exports = filterString;
