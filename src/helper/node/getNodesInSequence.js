// Utils
const logger = require('../../utils/winston');

const getNodesInSequence = (nodes = []) => {
  try {
    if (!nodes.length) return [null, 'No nodes provided.'];

    // * will store nodes in order
    const nodesInSequence = [];

    // * retreive first node
    const firstNode = nodes.find((node) => node.is_first);

    // * If no first node found
    if (!firstNode) {
      logger.error('No first node found in nodes provided.');
      return [null, 'No first node found in nodes provided.'];
    }

    // * push first node into sequence
    nodesInSequence.push(firstNode);

    while (true) {
      // * retreive current last node
      const lastNode = nodesInSequence[nodesInSequence.length - 1];

      // * if last node is undefined
      if (lastNode === null || lastNode === undefined) {
        return [nodesInSequence, null];
      }

      // * if next node does not exist, end of sequence
      if (
        lastNode.next_node_id === null ||
        lastNode.next_node_id === undefined
      ) {
        return [nodesInSequence, null];
      }

      // * find a node having node_id same as next_node_id of last node
      const nextNode = nodes.find(
        (node) => node.node_id === lastNode.next_node_id
      );

      // * insert nextNode in sequence
      nodesInSequence.push(nextNode);
    }
  } catch (err) {
    logger.error(`Error while sorting nodes in sequence: `, err);
    return [null, err.message];
  }
};

module.exports = getNodesInSequence;
