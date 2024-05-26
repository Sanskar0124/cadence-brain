// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

const fetchWorkflow = async ({
  trigger,
  company_id = null,
  cadence_id = null,
}) => {
  try {
    let query = [
      {
        // company trigger
        trigger,
        company_id,
        cadence_id: null,
      },
    ];
    if (cadence_id)
      query.push({
        // cadence trigger
        trigger,
        cadence_id,
      });
    const [workflows, errForWorkflows] = await Repository.fetchAll({
      tableName: DB_TABLES.WORKFLOW,
      query: {
        [Op.or]: query,
        //[Op.or]: [
        //{
        //// cadence trigger
        //trigger,
        //cadence_id,
        //},
        //{
        //// company trigger
        //trigger,
        //company_id,
        //cadence_id: null,
        //},
        //],
      },
    });
    if (errForWorkflows) return [null, errForWorkflows];
    if (!workflows?.length) return [null, `No workflow found.`];

    // If multiple entries found, return one for cadence
    if (workflows?.length > 1)
      return [workflows.filter((workflow) => workflow.cadence_id)?.[0], null];

    return [workflows?.[0], null];
  } catch (err) {
    logger.error(`Error while fetching workflow: `, err);
    return [null, err.message];
  }
};

//(async function test() {
//console.log(
//await fetchWorkflow({
//trigger: 'when_a_owner_changes',
//cadence_id: 8,
//company_id: 'f9411bdf-1d98-46bb-900e-e2ee78289f76',
//})
//);
//})();

module.exports = fetchWorkflow;
