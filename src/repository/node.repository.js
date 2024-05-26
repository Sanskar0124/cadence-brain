// Utils
const logger = require('../utils/winston');

// Models
const { Node, Task, sequelize } = require('../db/models');

// Helpers
const JsonHelper = require('../helper/json');

const createNode = async (node) => {
  try {
    // *  create a node for cadence
    const createdNode = await Node.create(node);
    logger.info('Created Node: ' + JSON.stringify(createdNode, null, 4));
    return [JsonHelper.parse(createdNode), null];
  } catch (err) {
    logger.error(`Error while creating node: ${err.message}`);
    return [null, err.message];
  }
};

const builkCreateNode = async (nodes) => {
  try {
    // *  create multiple nodes for cadence
    const createdNodes = await Node.bulkCreate(nodes);
    return [createdNodes, null];
  } catch (err) {
    logger.error(`Error while creating nodes: ${err.message}`);
    return [null, err.message];
  }
};

const getNode = async (query, nodeAttributes = []) => {
  try {
    let atrributesQuery = {};

    if (nodeAttributes?.length)
      atrributesQuery = {
        attributes: nodeAttributes,
      };

    // * fetch details for single node
    const node = await Node.findOne({
      where: query,
      ...atrributesQuery,
      raw: true,
    });

    return [node, null];
  } catch (err) {
    logger.error(`Error while fetching node: ${err.message}`);
    return [null, err.message];
  }
};

const getNodes = async (query) => {
  try {
    // * fetch details for multiple nodes
    const nodes = await Node.findAll({
      where: query,
      raw: true,
      order: [['step_number']],
    });

    return [nodes, null];
  } catch (err) {
    logger.error(`Error while fetching nodes: ${err.message}`);
    return [null, err.message];
  }
};

const updateNode = async (query, node) => {
  try {
    // * update nodes
    const data = await Node.update(node, {
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while updating node: ${err.message}`);
    return [null, err.message];
  }
};

const deleteNodes = async (query) => {
  try {
    // * delete a node
    const data = await Node.destroy({
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting node: ${err.message}`);
    return [null, err.message];
  }
};

const getNodesWithTask = async (query = {}, taskQuery = {}) => {
  try {
    const nodes = await Node.findAll({
      where: query,
      include: {
        model: Task,
        where: taskQuery,
        order: [['created_at', 'DESC']],
        attributes: ['completed', 'complete_time', 'is_skipped'],
        required: false,
      },
      attributes: {
        include: [
          [
            sequelize.literal(
              `CASE 
                WHEN Tasks.completed=1
                  THEN
                    "completed"
                  ELSE
				  	CASE
					  WHEN Tasks.is_skipped=1
					  	THEN
						  "skipped"
						ELSE
							CASE 
							WHEN Tasks.completed=0
								THEN 
									"ongoing"
								ELSE
									"not_created"
                   			END
             			END 
				END
              `
            ),
            'status',
          ],
        ],
      },
    });

    return [nodes, null];
  } catch (err) {
    logger.error(`Error while fetching nodes with task: ${err.message}.`);
    return [null, err.message];
  }
};

const NodeRepository = {
  createNode,
  builkCreateNode,
  getNode,
  getNodes,
  updateNode,
  deleteNodes,
  getNodesWithTask,
};

module.exports = NodeRepository;
