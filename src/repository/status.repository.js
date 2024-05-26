// Utils
const logger = require('../utils/winston');

// Packages
const { Op } = require('sequelize');
const moment = require('moment');

// Models
const {
  Status,
  Lead,
  LeadToCadence,
  Cadence,
  User,
  sequelize,
} = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const createStatus = async (status) => {
  try {
    const createdStatus = await Status.create(status);
    return [JSON.parse(JSON.stringify(createdStatus)), null];
  } catch (err) {
    logger.error(`Error while creating status: ${err.message}`);
    return [null, err.message];
  }
};

const deleteStatuses = async (lead_id) => {
  try {
    await Status.destroy({
      where: {
        lead_id,
      },
    });
    return ['Deleted Successfully.', null];
  } catch (err) {
    logger.error(`Error while deleting all status: ${err.message}`);
    return [null, err.message];
  }
};

const getRestoreStatus = async (lead_id) => {
  try {
    const status = await Status.findOne({
      where: {
        lead_id,
      },
      order: [['created_at', 'DESC']],
      offset: 1,
    });
    if (!status) return [null, null];

    return [JSON.parse(JSON.stringify(status)), null];
  } catch (err) {
    logger.error(`Error while restoring status: ${err.message}`);
    return [null, err.message];
  }
};

const deleteStatusByQuery = async (query) => {
  try {
    const status = await Status.destroy({
      where: query,
    });

    return [status, null];
  } catch (err) {
    logger.error(`Error while deleting status by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getStatusForLeadQuery = async (statusQuery, leadQuery) => {
  try {
    const statuses = await Status.findAll({
      where: statusQuery,
      attributes: [
        [sequelize.literal(`count(distinct(status.lead_id))`), 'count'],
        'status',
      ],
      include: {
        model: Lead,
        where: leadQuery,
        attributes: [],
      },
      group: ['status'],
    });

    // console.log(JSON.parse(JSON.stringify(statuses)));
    // console.log(statuses?.length);

    return [JsonHelper.parse(statuses), null];
  } catch (err) {
    logger.error(`Error while fetching status by lead query: ${err.message}.`);
    return [null, err.message];
  }
};

// getStatuForLeadQuery({ status: 'trash' }, { user_id: '3' });

// Cadence task followup

const cadenceLeadStatusCount = async ({
  cadence_id,
  user_ids,
  start_date = null,
  end_date = null,
}) => {
  try {
    const statuses = await Status.findAll({
      include: {
        model: Lead,
        where: {
          user_id: user_ids ?? { [Op.ne]: null },
        },
        attributes: [],
        // group: ['user_id'],
        include: [
          {
            model: User,
            attributes: ['first_name', 'last_name'],
          },
          {
            attributes: [],
            model: LeadToCadence,
            where: {
              cadence_id: cadence_id,
            },
          },
        ],
      },
      where: {
        created_at: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
            end_date ??
              moment(new Date(3000, 3, 24, 10, 33, 30, 0)).format(
                'YYYY-MM-DD HH:mm:ss'
              ),
          ],
        },
      },
      attributes: [
        [sequelize.literal(`COUNT(distinct(lead.lead_id))`), 'status_count'],
        'status',
        [sequelize.col('lead.user_id'), 'user_id'],
        [sequelize.col('Lead.User.first_name'), 'first_name'],
        [sequelize.col('Lead.User.last_name'), 'last_name'],
      ],
      group: ['lead.user_id', 'status'],
      // raw:true,
    });
    // console.log(JsonHelper.parse(statuses));
    return [JsonHelper.parse(statuses), null];
  } catch (err) {
    logger.error(
      `Error while fetching status count by cadence: ${err.message}.`
    );
    return [null, err.message];
  }
};

// cadenceLeadStatusCount({
//   cadence_id: 105,
//   // user_ids: ['53d7edd9-4628-4472-ab3f-64086b367aeb'],
// });

// Cadence Contacts Overview

const cadenceLeadStatusCountWithTotal = async ({
  cadence_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const statuses = await Status.findAll({
      include: {
        model: Lead,
        where: {
          user_id: { [Op.ne]: null },
        },
        attributes: [],
        // group: ['user_id'],
        include: [
          {
            model: User,
            attributes: ['first_name', 'last_name'],
          },
          {
            attributes: [],
            model: LeadToCadence,
            where: {
              cadence_id: cadence_id,
            },
          },
        ],
      },
      where: {
        // not working here
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
        status: { [Op.ne]: 'ongoing' },
      },
      attributes: [
        [sequelize.literal(`COUNT(DISTINCT lead.lead_id) `), 'count'],
        'status',
        [sequelize.col('lead.user_id'), 'user_id'],
        [sequelize.col('Lead.User.first_name'), 'first_name'],
        [sequelize.col('Lead.User.last_name'), 'last_name'],
      ],
      group: ['lead.user_id', 'status'],
      // raw:true,
    });
    // console.log(JsonHelper.parse(statuses, null, 4));
    return [JsonHelper.parse(statuses), null];
  } catch (err) {
    logger.error(
      `Error while fetching cadence lead status count: ${err.message}.`
    );
    return [null, err.message];
  }
};

// cadenceLeadStatusCountWithTotal({
//   cadence_id: [105],
// });

// Disqualification followup

// accepts only array of cadence_ids and user_ids
const disqualificationByCadence = async ({
  cadence_ids,
  user_ids,
  sd_ids,
  start_date = null,
  end_date = null,
}) => {
  try {
    let cadence_ids_tuple = cadence_ids
      ? `('${cadence_ids.join("','")}')`
      : null;
    let user_ids_tuple = user_ids ? `('${user_ids.join("','")}')` : null;
    let sd_ids_tuple = sd_ids ? `('${sd_ids.join("','")}')` : null;
    const literal = `COUNT(DISTINCT lead.lead_id) *100 / (SELECT COUNT(DISTINCT lead.lead_id) FROM status INNER JOIN crm.lead ON status.lead_id = crm.lead.lead_id INNER JOIN crm.lead_to_cadence ON crm.lead.lead_id = crm.lead_to_cadence.lead_id INNER JOIN crm.cadence ON crm.lead_to_cadence.cadence_id = cadence.cadence_id WHERE status.status="trash" ${
      user_ids_tuple ? `AND crm.lead.user_id IN ${user_ids_tuple}` : ''
    } ${
      cadence_ids_tuple
        ? `AND crm.lead_to_cadence.cadence_id IN ${cadence_ids_tuple}`
        : ''
    }  ${sd_ids_tuple ? `AND crm.cadence.sd_id IN ${sd_ids_tuple}` : ''} ) `;
    // console.log(literal);
    let start_date_formatted, end_date_formatted;
    if (start_date && end_date) {
      start_date_formatted = moment
        .unix(start_date / 1000)
        .format('YYYY-MM-DD HH:mm:ss');
      end_date_formatted = moment
        .unix(end_date / 1000)
        .format('YYYY-MM-DD HH:mm:ss');
    } else {
      start_date_formatted = moment(
        new Date(2018, 11, 24, 10, 33, 30, 0)
      ).format('YYYY-MM-DD HH:mm:ss');
      end_date_formatted = moment(new Date(2030, 3, 24, 10, 33, 30, 0)).format(
        'YYYY-MM-DD HH:mm:ss'
      );
    }
    const statuses = await Status.findAll({
      include: {
        model: Lead,
        attributes: [],
        // attributes: ['user_id'],
        // group: ['user_id'],
        where: {
          user_id: user_ids ?? { [Op.ne]: null },
        },
        include: {
          attributes: [],
          model: LeadToCadence,
          where: {
            cadence_id: cadence_ids,
          },
          include: {
            model: Cadence,
            attributes: ['sd_id'],
            // group: ['sd_id'],
            where: {
              sd_id: sd_ids ?? { [Op.ne]: null },
            },
          },
        },
      },
      where: {
        status: 'trash',
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
      attributes: [
        [sequelize.literal(`COUNT(DISTINCT lead.lead_id) `), 'count'],
        [
          sequelize.literal(
            `COUNT(DISTINCT lead.lead_id) *100 / (SELECT COUNT(DISTINCT lead.lead_id) FROM status INNER JOIN crm.lead ON status.lead_id = crm.lead.lead_id INNER JOIN crm.lead_to_cadence ON crm.lead.lead_id = crm.lead_to_cadence.lead_id INNER JOIN crm.cadence ON crm.lead_to_cadence.cadence_id = cadence.cadence_id WHERE status.status="trash" ${
              user_ids_tuple ? `AND crm.lead.user_id IN ${user_ids_tuple}` : ''
            } ${
              cadence_ids_tuple
                ? `AND crm.lead_to_cadence.cadence_id IN ${cadence_ids_tuple}`
                : ''
            }  ${
              sd_ids_tuple ? `AND crm.cadence.sd_id IN ${sd_ids_tuple}` : ''
            } 
            ${
              start_date_formatted && end_date_formatted
                ? ` AND status.created_at BETWEEN '${start_date_formatted}' AND '${end_date_formatted}' `
                : ''
            }
            ) `
          ),
          'percentage',
        ],
        'message',
        [
          sequelize.col('Lead.LeadToCadences.Cadences.cadence_id'),
          'cadence_id',
        ],
        [sequelize.col('Lead.LeadToCadences.Cadences.name'), 'name'],
      ],
      group: ['message'],
      raw: true,
      // logging: console.log,
    });
    // console.log(JsonHelper.parse(statuses, null, 4));
    return [JsonHelper.parse(statuses), null];
  } catch (err) {
    logger.error(
      `Error while fetching disqualification count by cadence: ${err.message}.`
    );
    return [null, err.message];
  }
};
// disqualificationByCadence({
//   cadence_ids: [105],
//   user_ids: [
//     'd7b7301b-9261-4c6d-a4b6-41a7fb23182a',
//     '6838763f-231b-4ac7-88f2-1061e35ebc37',
//   ],
// });

// disqualificationByCadence([105], null, null);

// disqualificationByCadence([105], null, [
//   'ed3c53e7-e51a-4767-bf8d-91d282f14189',
// ]);

// Cadence Activity : Convertion

const userCadenceConvertionsCount = async ({
  cadence_id,
  user_id,
  start_date,
  end_date,
}) => {
  try {
    const statuses = await Status.findAll({
      include: {
        model: Lead,
        attributes: [],
        where: {
          user_id: user_id ?? { [Op.ne]: null },
        },
        include: {
          model: LeadToCadence,
          where: {
            cadence_id: cadence_id ?? { [Op.ne]: null },
          },
          // group: ['cadence_id'],
          // attributes: ['cadence_id'],
          attributes: [],
          include: {
            model: Cadence,
            attributes: ['name'],
            where: {
              cadence_id: cadence_id ?? { [Op.ne]: null },
            },
          },
        },
      },
      attributes: [
        [sequelize.literal(`COUNT(DISTINCT lead.lead_id) `), 'count'],
        'status',
        'lead.LeadToCadences.cadence_id',
        [sequelize.col('Lead.LeadToCadences.Cadences.name'), 'name'],
      ],
      where: {
        status: ['converted', 'trash'],
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
      group: ['lead.LeadToCadences.cadence_id', 'status'],
      // cadence_id not sent unless raw true
      raw: true,
    });
    // console.log(JsonHelper.parse(statuses, null));
    return [JsonHelper.parse(statuses), null];
  } catch (err) {
    logger.error(`Error while fetching status count for user: ${err.message}.`);
    return [null, err.message];
  }
};

const groupCadenceConvertionsCount = async ({
  cadence_id,
  sd_id,
  start_date,
  end_date,
}) => {
  try {
    const statuses = await Status.findAll({
      include: {
        model: Lead,
        attributes: [],

        include: [
          {
            model: LeadToCadence,
            where: {
              cadence_id: cadence_id ?? { [Op.ne]: null },
            },
            // group: ['cadence_id'],
            // attributes: ['cadence_id'],
            attributes: [],
            include: {
              model: Cadence,
              attributes: ['name'],
              where: {
                cadence_id: cadence_id ?? { [Op.ne]: null },
                name: { [Op.ne]: null },
              },
            },
          },
          {
            model: User,
            where: {
              sd_id: sd_id,
            },
          },
        ],
      },
      attributes: [
        [sequelize.literal(`COUNT(DISTINCT lead.lead_id) `), 'count'],
        'status',
        'lead.LeadToCadences.cadence_id',
        [sequelize.col('Lead.LeadToCadences.Cadences.name'), 'name'],
      ],
      where: {
        status: ['converted', 'trash'],
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
      group: ['lead.LeadToCadences.cadence_id', 'status'],
      // cadence_id not sent unless raw true
      raw: true,
    });
    // console.log(JsonHelper.parse(statuses, null));
    return [JsonHelper.parse(statuses), null];
  } catch (err) {
    logger.error(`Error while fetching status count for user: `, err);
    return [null, err.message];
  }
};

// userCadenceConvertionsCount({
//   user_id: ['d7b7301b-9261-4c6d-a4b6-41a7fb23182a'],
// });

const StatusRepository = {
  createStatus,
  deleteStatuses,
  getRestoreStatus,
  deleteStatusByQuery,
  getStatusForLeadQuery,
  cadenceLeadStatusCount,
  cadenceLeadStatusCountWithTotal,
  userCadenceConvertionsCount,
  disqualificationByCadence,
  groupCadenceConvertionsCount,
};

module.exports = StatusRepository;
