// Utils
const logger = require('../../utils/winston');
const { NODE_TYPES, NODE_DATA } = require('../../utils/enums');

const getMailNodes = (nodes = [], node_id) => {
  try {
    if (!nodes.length) return [null, 'No nodes provided.'];
    let mailNodes = [];
    for (let node of nodes) {
      if (node.node_id == node_id) break;
      if (
        node.type === NODE_TYPES.MAIL ||
        node.type === NODE_TYPES.AUTOMATED_MAIL
      )
        mailNodes.push(node);
    }
    return [mailNodes, null];
  } catch (err) {
    logger.error(`Error while sorting nodes in sequence: `, err);
    return [null, err.message];
  }
};

module.exports = getMailNodes;
