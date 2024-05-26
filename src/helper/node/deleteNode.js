// Utils
const logger = require('../../utils/winston');
const { NODE_TYPES } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');

// Repositories
const NodeRepository = require('../../repository/node.repository');
const Repository = require('../../repository');
const { DB_TABLES } = require('../../utils/modelEnums');

const deleteNode = async (node_id, cadence) => {
  try {
    // * retreive node to be deleted
    const [nodeToBeDeleted, errForNodeToBeDeleted] =
      await NodeRepository.getNode({ node_id });
    if (errForNodeToBeDeleted) {
      return [null, errForNodeToBeDeleted];
    }

    if (cadence.metadata === undefined) {
      logger.error(`No metadata found while deleting a node.`);
      return [null, `No metadata found while deleting a node.`];
    }
    let metadata = cadence?.metadata || {};

    if (
      nodeToBeDeleted.type === NODE_TYPES.AUTOMATED_MAIL ||
      nodeToBeDeleted.type === NODE_TYPES.MAIL
    ) {
      // * find replied node

      const cadence_id = nodeToBeDeleted.cadence_id;

      const [nodesInCadence, errForNodesInCadence] =
        await NodeRepository.getNodes({ cadence_id });
      if (errForNodesInCadence)
        return serverErrorResponse(res, errForNodesInCadence);

      for (let node of nodesInCadence) {
        if (node.type === NODE_TYPES.REPLY_TO) {
          if (node.data.replied_node_id == node_id) {
            return [
              null,
              'Cannot delete this step without deleting replied to node.',
            ];
          }
        }
      }
    }

    const [deletedNode, errforDeletedNode] = await NodeRepository.deleteNodes({
      node_id,
    });

    if (errforDeletedNode) {
      return [null, errforDeletedNode];
    }

    // * If first node is deleted then update is_first for next node
    if (nodeToBeDeleted.is_first && nodeToBeDeleted.next_node_id) {
      // * query for finding next node
      const queryForNextNode = {
        node_id: nodeToBeDeleted.next_node_id,
      };

      // * update for next node
      const updateForNextNode = {
        is_first: true,
        wait_time: 0,
      };

      // * update next node
      await NodeRepository.updateNode(queryForNextNode, updateForNextNode);

      // * find all next nodes
      const queryForAllNextNodes = {
        cadence_id: nodeToBeDeleted.cadence_id,
      };

      // * decrement step number of all nodes since first node is deleted
      const updateForAllNextNodes = {
        step_number: sequelize.literal('step_number - 1'),
      };

      for (let deleted_node_id of Object.keys(metadata)) {
        // if any node had node to be deleted as its value then update it to next node for node to be deleted
        if (parseInt(metadata[deleted_node_id]) === parseInt(node_id))
          metadata[deleted_node_id] = nodeToBeDeleted.next_node_id;
      }

      // set next node id for node to be deleted
      metadata[node_id] = nodeToBeDeleted.next_node_id;

      // * update all next nodes
      const nodeUpdatePromise = NodeRepository.updateNode(
        queryForAllNextNodes,
        updateForAllNextNodes
      );

      const cadenceUpdatePromise = Repository.update({
        tableName: DB_TABLES.CADENCE,
        query: { cadence_id: nodeToBeDeleted.cadence_id },
        updateObject: {
          metadata,
        },
      });
      await Promise.all([nodeUpdatePromise, cadenceUpdatePromise]);

      return ['Deleted node and updated all nodes', null];
    }

    // * retreive node to be updated which is previous node i.e. node having node_id as its next_node_id

    // *  query for finding previous node
    const queryToFindPreviousNode = {
      next_node_id: node_id,
    };

    // * update for previous node
    const updateForPreviousNode = {
      next_node_id: nodeToBeDeleted.next_node_id,
    };

    // * update previous node
    await NodeRepository.updateNode(
      queryToFindPreviousNode,
      updateForPreviousNode
    );

    // * find all next nodes
    const queryForAllNextNodes = {
      cadence_id: nodeToBeDeleted.cadence_id,
      step_number: {
        [Op.gt]: nodeToBeDeleted.step_number,
      },
    };

    // * decrement step number of all nodes since first node is deleted
    const updateForAllNextNodes = {
      step_number: sequelize.literal('step_number - 1'),
    };

    for (let deleted_node_id of Object.keys(metadata)) {
      // if any node had node to be deleted as its value then update it to next node for node to be deleted
      if (parseInt(metadata[deleted_node_id]) === parseInt(node_id))
        metadata[deleted_node_id] = nodeToBeDeleted.next_node_id;
    }

    // set next node id for node to be deleted
    metadata[node_id] = nodeToBeDeleted.next_node_id;

    // * update all next nodes
    const nodeUpdatePromise = NodeRepository.updateNode(
      queryForAllNextNodes,
      updateForAllNextNodes
    );

    const cadenceUpdatePromise = Repository.update({
      tableName: DB_TABLES.CADENCE,
      query: { cadence_id: nodeToBeDeleted.cadence_id },
      updateObject: {
        metadata,
      },
    });
    await Promise.all([nodeUpdatePromise, cadenceUpdatePromise]);

    return ['Deleted node and updated previous node', null];
  } catch (err) {
    logger.error(`Error while deleting node: ${node_id}: `, err);
    return [null, err.message];
  }
};

module.exports = deleteNode;
