//Enums
const { WORKFLOW_TRIGGERS } = require('../../../src/utils/enums');
const { DB_MODELS, DB_TABLES } = require('../../../src/utils/modelEnums');

//Helpers
const WorkflowHelper = require('../../../src/helper/workflow');
const logger = require('../../utils/winston');

const afterCreateLink = () => {
  try {
    const modelName = DB_MODELS[DB_TABLES.LEADTOCADENCE];

    modelName.afterCreate((leadToCadence) => {
      WorkflowHelper.applyWorkflow({
        trigger: WORKFLOW_TRIGGERS.WHEN_A_LEAD_IS_ADDED_TO_CADENCE,
        cadence_id: leadToCadence.dataValues.cadence_id,
        lead_id: leadToCadence.dataValues.lead_id,
      });
    });
    return ['after Link Create hook applied', null];
  } catch (err) {
    logger.error('Error while invoking afterCreate Lead_to_cadence hook:', err);
    return [null, err.message];
  }
};
module.exports = afterCreateLink;
