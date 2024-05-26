// Utils
const logger = require('../../utils/winston');

const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');

// Repository
const Repository = require('../../repository');

// Helpers and services
const NodeHelper = require('../node');

const addNodeToCadence = async (node, previous_node_id) => {
  try {
    logger.info('Adding node to cadence...');

    // * retreive all nodes in requiredCadence
    const [nodesForCadence, errForNodesForCadence] = await Repository.fetchAll({
      tableName: DB_TABLES.NODE,
      query: { cadence_id: node.cadence_id },
      extras: {
        order: [['step_number']],
      },
    });
    if (errForNodesForCadence) return [null, errForNodesForCadence];

    // * no nodes exist, add node as first node
    if (!previous_node_id) {
      // no nodes exist
      if (!nodesForCadence.length) {
        logger.info('Adding node as first node to cadence...');

        // * add new node
        const [createdNode, errForCreatedNode] = await Repository.create({
          tableName: DB_TABLES.NODE,
          createObject: {
            ...node,
            is_first: true, // * mark it as first node
            step_number: 1,
            wait_time: 0,
          },
        });
        if (errForCreatedNode) return [null, errForCreatedNode];

        logger.info('Added node as first node to cadence...');

        // * return new node
        return [createdNode, null];
      } else {
        // nodes exist
        logger.info('Adding node as first node to cadence...');

        const [previousFirstNode, errForPreviousFirstNode] =
          await Repository.fetchOne({
            tableName: DB_TABLES.NODE,
            query: {
              cadence_id: node.cadence_id,
              is_first: true,
            },
          });
        if (errForPreviousFirstNode) return [null, errForPreviousFirstNode];

        // Updating previous first node to is first false
        const [updatedPreviousFirstNode, errForUpdatePreviousFirstNode] =
          await Repository.update({
            tableName: DB_TABLES.NODE,
            query: {
              cadence_id: node.cadence_id,
              is_first: true,
            },
            updateObject: {
              is_first: false,
            },
          });
        if (errForUpdatePreviousFirstNode)
          return [null, errForUpdatePreviousFirstNode];

        // * add new first node
        const [createdNode, errForCreatedNode] = await Repository.create({
          tableName: DB_TABLES.NODE,
          createObject: {
            ...node,
            is_first: true, // * mark it as first node
            step_number: 1,
            wait_time: 0,
            next_node_id: previousFirstNode.node_id,
          },
        });
        if (errForCreatedNode) return [null, errForCreatedNode];

        // * sort nodes in order
        //const [nodesInSequence, errForNodesInSequence] =
        //NodeHelper.getNodesInSequence([createdNode, ...nodesForCadence]);
        //if (errForNodesInSequence) return [null, errForNodesInSequence];

        // increment the step numbers of the rest of the nodes after the createdNode
        //const nextNodesIds = nodesInSequence
        //.filter((node) => node.step_number > 1)
        //.map((node) => node.node_id);

        const [updateNextNodes, errForUpdateNextNodes] =
          await Repository.update({
            tableName: DB_TABLES.NODE,
            query: {
              node_id: {
                [Op.ne]: createdNode.node_id,
              },
              cadence_id: createdNode.cadence_id,
            },
            updateObject: {
              step_number: sequelize.literal('step_number + 1'),
            },
          });
        if (errForUpdateNextNodes) return [null, errForUpdateNextNodes];

        return [createdNode, null];
      }
    }

    // * sort nodes in order
    const [nodesInSequence, errForNodesInSequence] =
      NodeHelper.getNodesInSequence(nodesForCadence);
    if (errForNodesInSequence) return [null, errForNodesInSequence];

    // retrieve the previous node
    const previousNode = nodesInSequence.find(
      (node) => parseInt(node.node_id) === parseInt(previous_node_id)
    );
    if (!previousNode) return [null, 'Invalid previous node id.'];

    // create new node
    const [createdNode, errForCreatedNode] = await Repository.create({
      tableName: DB_TABLES.NODE,
      createObject: {
        ...node,
        step_number: previousNode.step_number + 1,
      },
    });
    if (errForCreatedNode) return [null, errForCreatedNode];

    // check if there were nodes after the previous node
    if (previousNode.next_node_id) {
      // update the next_node_id of the createdNode with the
      // next_node_id of the previous node
      const [updateCreatedNode, errForUpdateCreatedNode] =
        await Repository.update({
          tableName: DB_TABLES.NODE,
          query: { node_id: createdNode.node_id },
          updateObject: {
            next_node_id: previousNode.next_node_id,
          },
        });

      // increment the step numbers of the rest of the nodes after the createdNode
      const nextNodesIds = nodesInSequence
        .filter((node) => node.step_number > previousNode.step_number)
        .map((node) => node.node_id);

      const [updateNextNodes, errForUpdateNextNodes] = await Repository.update({
        tableName: DB_TABLES.NODE,
        query: {
          node_id: {
            [Op.in]: nextNodesIds,
          },
        },
        updateObject: {
          step_number: sequelize.literal('step_number + 1'),
        },
      });
      if (errForUpdateNextNodes) return [null, errForUpdateNextNodes];
    }

    // * update next_node_id for previous node in sequence
    const [updateData, errForUpdateData] = await Repository.update({
      tableName: DB_TABLES.NODE,
      query: { node_id: previous_node_id },
      updateObject: {
        next_node_id: createdNode.node_id,
      },
    });
    if (errForUpdateData) return [null, errForUpdateData];

    logger.info('Added node to cadence.');

    // * new node
    return [createdNode, null];
  } catch (err) {
    logger.error(`Error while adding node to cadence: `, err);
    return [null, err.message];
  }
};

module.exports = addNodeToCadence;
