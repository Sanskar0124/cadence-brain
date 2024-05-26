// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { NODE_TYPES, CADENCE_ACTIONS } = require('../../utils/enums');

//models
const { sequelize } = require('../../db/models');

// Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

// Helpers and services
const addNodeToCadence = require('./addNodeToCadence');
const checkCadenceActionAccess = require('./checkCadenceAccess');

const ShareCadenceTOCompany = async (
  { cadence_id, user, object, is_workflow, ogCadence },
  t
) => {
  try {
    let createCadences = [];

    // Checking Cadence action access
    const [access, errForAccess] = checkCadenceActionAccess({
      cadence: object,
      user,
      action: CADENCE_ACTIONS.SHARE,
      data: { ogCadence },
    });
    if (errForAccess) {
      return [
        null,
        `Error while checking cadence action access: ${errForAccess}`,
      ];
    }
    if (!access) return [null, 'You do not have access to this functionality'];

    // * creating a cadence
    const [cadence, errForCadence] = await Repository.create({
      tableName: DB_TABLES.CADENCE,
      createObject: object,
      t,
    });
    if (errForCadence)
      return [
        null,
        {
          error: `Error while creating cadence: ${errForCadence}`,
          name: object.name,
        },
      ];
    createCadences.push(cadence);

    // creating node
    const [nodes, errForNodes] = await Repository.fetchAll({
      tableName: DB_TABLES.NODE,
      query: { cadence_id },
      t,
      extras: { order: ['step_number'] },
    });
    if (errForNodes)
      return [null, `Error while fetching nodes: ${errForNodes}`];

    let previousNode = null;
    let oldToNewNodeMapping = {};
    for (let node of nodes) {
      node.cadence_id = cadence.cadence_id;
      let oldNodeId = node.node_id;
      delete node?.node_id;
      delete node?.next_node_id;
      delete node?.step_number;
      delete node?.is_first;
      delete node?.created_at;
      delete node?.updated_at;

      if (node.type === NODE_TYPES.REPLY_TO && node?.data?.replied_node_id)
        node.data.replied_node_id =
          oldToNewNodeMapping[node.data.replied_node_id];

      // * create a node
      const [createdNode, errForNode] = await addNodeToCadence(
        node,
        previousNode?.node_id
      );
      previousNode = createdNode;
      oldToNewNodeMapping[oldNodeId] = createdNode.node_id;
    }

    // Sharing workflow conditionally
    if (is_workflow) {
      const [workflows, errForWorkflow] = await Repository.fetchAll({
        tableName: DB_TABLES.WORKFLOW,
        query: {
          cadence_id: cadence_id,
        },
        t,
      });
      if (errForWorkflow)
        return [null, `Error while fetching workflow: ${errForWorkflow}`];

      for (let workflow of workflows) {
        workflow.cadence_id = cadence.cadence_id;
        delete workflow?.workflow_id;
        delete workflow?.created_at;
        delete workflow?.updated_at;
        // * create a workflow
        const [createdWorkflow, errForCreatingWorkflow] =
          await Repository.create({
            tableName: DB_TABLES.WORKFLOW,
            createObject: workflow,
            t,
          });
        if (errForCreatingWorkflow)
          return [null, `Error while creating workflow: ${errForWorkflow}`];
      }
    }

    return [createCadences, null];
  } catch (err) {
    logger.error(`Error in ShareCadence: `, err);
    return [null, err.message];
  }
};

module.exports = ShareCadenceTOCompany;
