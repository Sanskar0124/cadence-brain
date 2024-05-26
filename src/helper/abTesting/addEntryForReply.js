// Utils
const logger = require('../../utils/winston');
const { NODE_TYPES } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const { sequelize } = require('../../db/models');
const Repository = require('../../repository');

const addEntryForReply = async (node_id, mail) => {
  try {
    // create row for ab testing
    const [node, errForNode] = await Repository.fetchOne({
      tableName: DB_TABLES.NODE,
      query: {
        node_id: node_id,
      },
    });
    if (errForNode)
      logger.error(`Error while fetching node: `, errForAbTesting);

    if (
      (node.type === NODE_TYPES.MAIL && node.data.aBTestEnabled == true) ||
      (node.type === NODE_TYPES.AUTOMATED_MAIL &&
        node.data.aBTestEnabled == true) ||
      (node.type === NODE_TYPES.REPLY_TO && node.data.aBTestEnabled == true) ||
      (node.type === NODE_TYPES.AUTOMATED_REPLY_TO &&
        node.data.aBTestEnabled == true)
    ) {
      // Fetch which AB Template was used using thread id

      const [oldEntry, errForOldEntry] = await Repository.fetchOne({
        tableName: DB_TABLES.A_B_TESTING,
        query: {
          node_id: node_id,
        },
        include: {
          [DB_TABLES.EMAIL]: {
            where: {
              thread_id: mail.thread_id,
              sent: true,
            },
            required: true,
          },
        },
      });
      if (errForOldEntry)
        logger.error(
          `Error while fetching old AB Test Entry: `,
          errForOldEntry
        );

      const [abTestEntry, errForAbTesting] = await Repository.create({
        tableName: DB_TABLES.A_B_TESTING,
        createObject: {
          node_id: node_id,
          message_id: mail.id,
          ab_template_id: oldEntry.ab_template_id,
        },
      });
      if (errForAbTesting)
        logger.error(
          `Error while creation of AB Testing Entry: `,
          errForAbTesting
        );

      return [abTestEntry, null];
    }

    return [true, null];
  } catch (err) {
    logger.error(
      `Error while trying to create an ab testing entry for reply: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = addEntryForReply;
