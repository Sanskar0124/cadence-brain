// Utils
const logger = require('../utils/winston');
const { LEAD_STATUS } = require('../utils/enums');

// Packages
const { Op } = require('sequelize');
const moment = require('moment');

// Models
const {
  LeadToCadence,
  Lead,
  Account,
  Lead_phone_number,
  Lead_email,
  User,
  Cadence,
  sequelize,
} = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const createLeadToCadenceLink = async (link) => {
  try {
    const createdLink = await LeadToCadence.create(link);
    return [createdLink, null];
  } catch (err) {
    logger.error(`Error while creating lead to cadence link: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getLeadToCadenceLinkByQuery = async (query) => {
  try {
    const links = await LeadToCadence.findAll({
      where: query,
    });
    return [links, null];
  } catch (err) {
    logger.error(`Error while fetching lead to cadence links: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getLeadToCadenceLinksByLeadQuery = async (link_query, lead_query) => {
  try {
    const links = await LeadToCadence.findAll({
      where: link_query,
      include: [
        {
          model: Lead,
          where: lead_query,
          include: [Account, Lead_phone_number, User, Lead_email],
        },
      ],
    });
    return [links, null];
  } catch (err) {
    logger.error(`Error while fetching links for lead query: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getLeadToCadenceLinksByQueryWithAttributes = async ({
  link_query,
  lead_query,
  lead_attributes,
  user_attributes,
}) => {
  try {
    const links = await LeadToCadence.findAll({
      where: link_query,
      include: [
        {
          model: Lead,
          where: lead_query,
          attributes: lead_attributes,
          include: [
            { model: Lead_phone_number },
            { model: User, attributes: user_attributes },
            { model: Lead_email },
          ],
        },
      ],
    });
    return [links, null];
  } catch (err) {
    logger.error(
      `Error while fetching links for lead query with attributes: ${err.message}`
    );
    return [null, err.message]; // for database error
  }
};

const getLeadToCadenceLinkByLeadQuery = async (link_query, lead_query) => {
  try {
    const links = await LeadToCadence.findOne({
      where: link_query,
      include: [
        {
          model: Lead,
          where: lead_query,
          include: [Account, Lead_phone_number, User, Lead_email],
        },
      ],
    });
    return [links, null];
  } catch (err) {
    logger.error(`Error while fetching links for lead query: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const updateLeadToCadenceLinkByQuery = async (query, link) => {
  try {
    const updatedLink = await LeadToCadence.update(link, {
      where: query,
    });
    return [updatedLink, null];
  } catch (err) {
    logger.error(`Error while updating lead to cadence link: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const deleteLeadToCadenceLink = async (query) => {
  try {
    const deletedLinks = await LeadToCadence.destroy({
      where: query,
    });
    return [deletedLinks, null];
  } catch (err) {
    logger.error(`Error while deleting lead to cadence links: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getCountForLeadToCadenceLinkByQuery = async (query) => {
  try {
    const links = await LeadToCadence.count({
      where: query,
    });
    return [links, null];
  } catch (err) {
    logger.error(
      `Error while fetching count for lead to cadence links: ${err.message}`
    );
    return [null, err.message]; // for database error
  }
};

const getCountForLeadToCadenceLinkByLeadQuery = async (
  link_query,
  lead_query
) => {
  try {
    const links = await LeadToCadence.findAll({
      where: link_query,
      include: [
        {
          model: Lead,
          where: lead_query,
          include: [Account, Lead_phone_number, User, Lead_email],
        },
      ],
    });
    return [links, null];
  } catch (err) {
    logger.error(`Error while fetching links for lead query: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getAccountsForCadence = async (cadence_id) => {
  try {
    const links = await LeadToCadence.findAll({
      where: { cadence_id },
      include: [
        {
          model: Lead,
          include: [{ model: Account, include: User }, { model: User }],
        },
      ],
    });
    return [links, null];
  } catch (err) {
    logger.error(
      `Error while fetching accounts for cadence query: ${err.message}`
    );
    return [null, err.message]; // for database error
  }
};

const getLeadToCadenceLinkByCadenceQuery = async (query, cadence_query) => {
  try {
    const links = await LeadToCadence.findAll({
      where: query,
      include: [
        {
          model: Cadence,
          where: cadence_query,
        },
      ],
    });
    return [JSON.parse(JSON.stringify(links)), null];
  } catch (err) {
    logger.error(`Error while fetching lead to cadence links: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getLastLeadToCadenceByQuery = async (query) => {
  try {
    const leadToCadence = await LeadToCadence.findOne({
      where: query,
      order: [['created_at', 'DESC']],
    });
    // console.log(JSON.stringify(leadToCadence, null, 4));
    return [leadToCadence, null];
  } catch (err) {
    logger.error(
      `Error while fetching last lead-to-cadence by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getLastLeadToCadenceByLeadQuery = async (leadCadenceQuery, leadQuery) => {
  try {
    const leadToCadence = await LeadToCadence.findAll({
      where: leadCadenceQuery,
      attributes: ['lead_cadence_order'],
      include: {
        model: Lead,
        where: leadQuery,
        attributes: [],
      },
      order: [
        ['created_at', 'DESC'],
        [{ model: Lead }, 'created_at', 'DESC'],
        [{ model: Lead }, 'lead_id', 'DESC'],
      ],
    });
    // console.log(JSON.stringify(leadToCadence, null, 4));
    return [JsonHelper.parse(leadToCadence), null];
  } catch (err) {
    logger.error(
      `Error while fetching last lead-to-cadence by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getLeadToCadenceLinksByLeadAndCadenceQuery = async (
  link_query,
  lead_query,
  cadence_query
) => {
  try {
    const links = await LeadToCadence.findAll({
      where: link_query,
      attributes: ['lead_id', 'cadence_id'],
      include: [
        {
          model: Lead,
          where: lead_query,
          attributes: [
            'lead_id',
            'first_name',
            'last_name',
            'created_at',
            'status',
            'type',
          ],
          include: [
            {
              model: Account,
              attributes: ['size', 'name', 'url'],
            },
            {
              model: Lead_phone_number,
              attributes: ['phone_number', 'is_primary', 'timezone', 'time'],
            },
            Lead_email,
          ],
        },
        {
          model: Cadence,
          where: cadence_query,
          attributes: [],
        },
      ],
    });
    return [links, null];
  } catch (err) {
    logger.error(
      `Error while fetching links for lead and cadence query: ${err.message}`
    );
    return [null, err.message];
  }
};

// Cadence Activity

const getUnsubscribeLeadCountForUserByCadence = async ({
  user_id,
  cadence_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const unsubscribeLeadCount = await LeadToCadence.findAll({
      where: {
        unsubscribed: true,
        cadence_id: cadence_id ?? { [Op.ne]: null },
        created_at: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
            end_date ??
              moment(new Date(2050, 3, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
          ],
        },
      },
      include: [
        {
          model: Cadence,
          attributes: ['name'],
        },
        {
          model: Lead,
          required: true,
          include: {
            model: User,
            required: true,
            where: {
              user_id: user_id,
            },
            attributes: [],
          },
          attributes: [],
        },
      ],
      attributes: [
        [
          sequelize.literal(`COUNT(DISTINCT Leads.lead_id) `),
          'unsubscribe_count',
        ],

        'cadence_id',
        [sequelize.col('Cadences.name'), 'name'],

        // 'lead_cadence_id',
      ],
      group: ['cadence_id'],
      raw: true,
    });
    // console.log(JsonHelper.parse(unsubscribeLeadCount));
    return [JsonHelper.parse(unsubscribeLeadCount), null];
  } catch (err) {
    logger.error(
      `Error while fetching unsubscribe lead count for user by cadence: ${err.message}`
    );
    return [null, err.message];
  }
};

// getUnsubscribeLeadCountForUserByCadence({
//   user_id: ['d7b7301b-9261-4c6d-a4b6-41a7fb23182a'],
//   // cadence_id: [144, 178, 139],
// });

const getUnsubscribeLeadCountForGroupByCadence = async ({
  sd_id,
  cadence_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const unsubscribeLeadCount = await LeadToCadence.findAll({
      where: {
        unsubscribed: true,
        cadence_id: cadence_id ?? { [Op.ne]: null },
        created_at: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
            end_date ??
              moment(new Date(2050, 3, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
          ],
        },
      },
      include: [
        {
          model: Cadence,
          attributes: ['name'],
        },
        {
          model: Lead,
          required: true,
          include: {
            model: User,
            required: true,
            where: {
              sd_id: sd_id,
            },
            attributes: [],
          },
          attributes: [],
        },
      ],
      attributes: [
        [
          sequelize.literal(`COUNT(DISTINCT Leads.lead_id) `),
          'unsubscribe_count',
        ],

        'cadence_id',
        [sequelize.col('Cadences.name'), 'name'],

        // 'lead_cadence_id',
      ],
      group: ['cadence_id'],
      raw: true,
    });
    // console.log(JsonHelper.parse(unsubscribeLeadCount));
    return [JsonHelper.parse(unsubscribeLeadCount), null];
  } catch (err) {
    logger.error(
      `Error while fetching unsubscribe lead count for user by cadence: `,
      err
    );
    return [null, err.message];
  }
};

// Cadence step performing analyse

const getUnsubscribeLeadCountForUserByNode = async ({
  user_id,
  node_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const unsubscribeLeadCount = await LeadToCadence.findAll({
      where: {
        unsubscribed: true,
        unsubscribe_node_id: node_id,
        lead_id: { [Op.ne]: null },
        created_at: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
            end_date ??
              moment(new Date(2030, 3, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
          ],
        },
      },
      include: {
        model: Lead,
        required: true,
        include: {
          model: User,
          required: true,
          where: {
            user_id: user_id ?? { [Op.ne]: null },
          },
          attributes: ['user_id'],
        },
        attributes: ['lead_id', 'user_id'],
        group: ['user_id'],
      },
      attributes: [
        [
          sequelize.literal(`COUNT(DISTINCT Leads.lead_id) `),
          'unsubscribe_count',
        ],
        'unsubscribe_node_id',
      ],
      group: ['unsubscribe_node_id'],
    });
    // console.log(JsonHelper.parse(unsubscribeLeadCount));
    return [JsonHelper.parse(unsubscribeLeadCount), null];
  } catch (err) {
    logger.error(
      `Error while fetching unsubscribe lead count for user by node: ${err.message}`
    );
    return [null, err.message];
  }
};

// getUnsubscribeLeadCountForUserByNode({ user_id: ['3'], node_id: ['512'] });

const getActiveContactsCountByCadenceId = async ({
  cadence_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const activeContactsCount = await LeadToCadence.findAll({
      where: {
        cadence_id: cadence_id ?? { [Op.ne]: null },
      },

      include: [
        {
          model: Lead,
          attributes: [],
          required: true,
          where: {
            status: {
              [Op.in]: [
                LEAD_STATUS.ACTIVE,
                LEAD_STATUS.ONGOING,
                LEAD_STATUS.PAUSED,
              ],
            },
          },
          include: {
            model: User,
            attributes: ['first_name', 'last_name'],
          },
        },
      ],

      attributes: [
        [sequelize.literal(`COUNT(DISTINCT Leads.lead_id) `), 'count'],
        // [sequelize.literal(`COUNT(DISTINCT Leads.lead_id) WHERE status="in_progress" `), 'count_status'],
        [sequelize.col('Leads.User.user_id'), 'user_id'],
        [sequelize.col('Leads.User.first_name'), 'first_name'],
        [sequelize.col('Leads.User.last_name'), 'last_name'],
        [sequelize.col('LeadToCadence.status'), 'status'],
      ],
      group: ['Leads.User.user_id', 'LeadToCadence.status'],
      // raw: true,
    });
    // console.log(JsonHelper.parse(activeContactsCount));
    return [JsonHelper.parse(activeContactsCount), null];
  } catch (err) {
    logger.error(
      `Error while fetching active contacts count by cadence id: ${err.message}`
    );
    return [null, err.message];
  }
};

// getActiveContactsCountByCadenceId({
//   cadence_id: ['105'],
// });

const getTotalContactsCountByCadenceId = async ({
  cadence_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const activeContactsCount = await LeadToCadence.findAll({
      where: {
        cadence_id: cadence_id ?? { [Op.ne]: null },
        created_at: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
            end_date ??
              moment(new Date(2030, 3, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
          ],
        },
      },

      include: [
        {
          model: Lead,
          attributes: [],
          include: {
            model: User,
            attributes: ['first_name', 'last_name'],
          },
        },
      ],

      attributes: [
        [sequelize.literal(`COUNT(DISTINCT Leads.lead_id) `), 'count'],
        // [sequelize.literal(`COUNT(DISTINCT Leads.lead_id) WHERE status="in_progress" `), 'count_status'],
        [sequelize.col('Leads.User.user_id'), 'user_id'],
        [sequelize.col('Leads.User.first_name'), 'first_name'],
        [sequelize.col('Leads.User.last_name'), 'last_name'],
        // [sequelize.col('LeadToCadence.status'), 'status'],
      ],
      group: ['Leads.User.user_id'],
      // raw: true,
    });
    // console.log(JsonHelper.parse(activeContactsCount));
    return [JsonHelper.parse(activeContactsCount), null];
  } catch (err) {
    logger.error(
      `Error while fetching active contacts count by cadence id: ${err.message}`
    );
    return [null, err.message];
  }
};

// getTotalContactsCountByCadenceId({
//   cadence_id: '105',
// });

const LeadToCadenceRepository = {
  createLeadToCadenceLink,
  getLeadToCadenceLinksByLeadQuery,
  getLeadToCadenceLinksByQueryWithAttributes,
  getLeadToCadenceLinkByQuery,
  updateLeadToCadenceLinkByQuery,
  deleteLeadToCadenceLink,
  getCountForLeadToCadenceLinkByQuery,
  getCountForLeadToCadenceLinkByLeadQuery,
  getAccountsForCadence,
  getLeadToCadenceLinkByCadenceQuery,
  getLastLeadToCadenceByQuery,
  getLeadToCadenceLinkByLeadQuery,
  getLastLeadToCadenceByLeadQuery,
  getLeadToCadenceLinksByLeadAndCadenceQuery,
  getUnsubscribeLeadCountForUserByCadence,
  getUnsubscribeLeadCountForUserByNode,
  getActiveContactsCountByCadenceId,
  getTotalContactsCountByCadenceId,
  getUnsubscribeLeadCountForGroupByCadence,
};

module.exports = LeadToCadenceRepository;
