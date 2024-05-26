// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Db
const { sequelize } = require('../../db/models');

// Repositories
const Repository = require('../../repository');

const searchLeads = async (searchText, userQuery) => {
  try {
    if (!userQuery) return [null, 'Invalid search'];

    let searchQuery = [
      sequelize.literal(
        `LOWER(Lead_emails.email_id) LIKE '%${searchText.toLowerCase()}%'`
      ),
      sequelize.literal(
        `LOWER(Account.name) LIKE '%${searchText.toLowerCase()}%'`
      ),
      sequelize.literal(
        `LOWER(CONCAT(\`first_name\`,' ',\`last_name\`)) LIKE '%${searchText.toLowerCase()}%'`
      ),
    ];

    if (/^[0-9+\- ()]+$/.test(searchText))
      searchQuery.push(
        sequelize.literal(
          `Lead_phone_numbers.phone_number LIKE '%${searchText}%'`
        )
      );

    const [leads, errForLeads] = await Repository.fetchAll({
      tableName: DB_TABLES.LEAD,
      query: {
        [Op.and]: [
          userQuery,
          {
            [Op.or]: searchQuery,
          },
        ],
      },
      include: {
        [DB_TABLES.LEAD_PHONE_NUMBER]: {
          attributes: [],
        },
        [DB_TABLES.LEAD_EMAIL]: {
          attributes: [],
        },
        [DB_TABLES.ACCOUNT]: {
          attributes: ['name', 'size'],
        },
      },
      extras: {
        attributes: [
          'lead_id',
          'first_name',
          'last_name',
          'full_name',
          'status',
        ],
      },
    });
    if (errForLeads) return [null, errForLeads];

    return [leads, null];
  } catch (err) {
    logger.error(`Error while searching leads: `, err);
    return [null, err.message];
  }
};

module.exports = searchLeads;
