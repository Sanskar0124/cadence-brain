// * Utils
const logger = require('../../utils/winston');
const {
  AUTOMATED_WORKFLOW_FILTER_OPERATION,
  AUTOMATED_WORKFLOW_FILTER_TYPES,
  AUTOMATED_WORKFLOW_DATA_TYPES,
  MODEL_TYPES,
} = require('../../utils/enums');

// * Helpers
const { filterString, filterDate, filterId } = require('./filters/');

const processLead = ({ lead, account, user, filter }) => {
  try {
    let results = [];

    if (filter.children)
      for (let child of filter.children)
        results.push(processLead({ lead, account, user, filter: child }));

    if (filter.operation === AUTOMATED_WORKFLOW_FILTER_OPERATION.CONDITION) {
      switch (filter.condition.integration_data_type) {
        case AUTOMATED_WORKFLOW_DATA_TYPES.STRING:
          return filterString({
            objects: { lead, account, user },
            model_type: filter.condition.model_type,
            integration_field: filter.condition.integration_field,
            equator: filter.condition.equator,
            value: filter.condition.value,
            id: filter.id,
          });

        case AUTOMATED_WORKFLOW_DATA_TYPES.DATE:
          return filterDate({
            objects: { lead, account, user },
            model_type: filter.condition.model_type,
            integration_field: filter.condition.integration_field,
            equator: filter.condition.equator,
            value: filter.condition.value,
            id: filter.id,
          });
      }
    }

    if (filter.operation === AUTOMATED_WORKFLOW_FILTER_OPERATION.AND) {
      // console.log('[OPERATION AND REACHED]: | Id: ' + filter.id);

      // console.log('OPERATION CHILDREN ===>');
      // filter.children.forEach((child) => {
      //   console.log(child.id);
      // });

      // console.log(' ----- ');

      let success = 1;

      results.forEach((r) => {
        if (r.status === 0) success = 0;
      });

      // console.log(results);
      // console.log(success);

      return { id: filter.id, status: success };
    }

    if (filter.operation === AUTOMATED_WORKFLOW_FILTER_OPERATION.OR) {
      // console.log('[OPERATION OR REACHED]: | Id: ' + filter.id);

      // console.log('OPERATION CHILDREN ===>');
      // filter.children.forEach((child) => {
      //   console.log(child.id);
      // });

      // console.log(' ----- ');

      let success = 0;
      results.forEach((r) => {
        if (r.status === 1) success = 1;
      });
      // console.log(results);
      // console.log(success);
      return { id: filter.id, status: success };
    }

    // console.log('RESULTS ===> ');
    // console.log(results);

    logger.info('Successfully processed lead');
    return { id: 'fallback', status: 0 };
  } catch (err) {
    logger.error('An error occurred while processing lead ', err);
    return [null, err.message];
  }
};

module.exports = processLead;
