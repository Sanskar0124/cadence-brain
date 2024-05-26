// * Utils
const logger = require('../../utils/winston');
const { AUTOMATED_WORKFLOW_ACTIONS } = require('../../utils/enums');

// * Action Imports
const { addToCadence } = require('./actions');

const processAction = async ({ lead, action, integration_type, meta }) => {
  try {
    switch (action.type) {
      case AUTOMATED_WORKFLOW_ACTIONS.ADD_TO_CADENCE:
        addToCadence({
          lead,
          cadence_id: action.cadence_id,
          integration_type,
          meta,
        });
        break;
    }
    return [true, null];
  } catch (err) {
    logger.error('An error occurred while processing action ', err);
    return [null, err.message];
  }
};

module.exports = processAction;
