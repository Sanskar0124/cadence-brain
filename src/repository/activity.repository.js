// Utils
const logger = require('../utils/winston');

// Packages
const { Op } = require('sequelize');
const moment = require('moment');

// Helpers and services
const JsonHelper = require('../helper/json');

// Models
const {
  Activity,
  Email,
  Lead,
  Cadence,
  sequelize,
  LinkStore,
  LeadToCadence,
  User,
} = require('../db/models');

const createActivity = async (activity) => {
  try {
    const createdActivity = await Activity.create(activity);
    return [createdActivity, null];
  } catch (err) {
    // prety print err.errors
    if (err.errors[0])
      if (err.errors[0].message.includes('must be unique'))
        return [null, 'duplicate'];
      else logger.error(JSON.stringify(err.errors, null, 4));
    else logger.error(`Error while creating activity: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const createBulkActivity = async (activities) => {
  try {
    const bulkCreate = await Activity.bulkCreate(activities);
    return [bulkCreate, null];
  } catch (err) {
    logger.error(`Error while creating bulk activity: ${err.message}`);
    return [null, err.message];
  }
};

const getActivityById = async (activity_id) => {
  try {
    const activity = await Activity.findOne({
      where: {
        activity_id,
      },
    });
    return [activity, null];
  } catch (err) {
    logger.error(`Error while getting activity by id: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getActivityByQuery = async (query) => {
  try {
    const activity = await Activity.findOne({
      where: query,
    });
    return [activity, null];
  } catch (err) {
    logger.error(`Error while getting activity by query: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getActivitiesByQuery = async (query) => {
  try {
    const activity = await Activity.findAll({
      where: query,
    });
    return [activity, null];
  } catch (err) {
    logger.error(`Error while getting activities by query: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const getSortedActivitiesByQuery = async (query, order) => {
  try {
    const activity = await Activity.findAll({
      where: query,
      order,
    });
    return [activity, null];
  } catch (err) {
    logger.error(
      `Error while getting sorted activities by query: ${err.message}`
    );
    return [null, err.message]; // for database error
  }
};

const getActivityByRingoverCallId = async (ringover_call_id) => {
  try {
    const activity = await Activity.findOne({
      where: {
        ringover_call_id,
      },
    });
    return [activity, null];
  } catch (err) {
    logger.error(
      `Error while getting activities by ringover call id: ${err.message}`
    );
    return [null, err.message]; // for database error
  }
};

const getActivities = async (lead_id, order = [['created_at', 'DESC']]) => {
  try {
    if (!order?.length) order = [];
    const activities = await Activity.findAll({
      where: {
        lead_id,
      },
      attributes: {
        exclude: ['ringover_call_id', 'salesforce_task_id', 'gmail_message_id'],
      },
      include: [
        {
          model: Cadence,
          attributes: ['name'],
        },
        {
          model: Email,
          attributes: ['status'],
          include: [
            {
              model: LinkStore,
              attributes: ['redirect_url', 'clicked', 'link_text'],
            },
          ],
        },
      ],
      order,
    });
    return [activities, null];
  } catch (err) {
    logger.error(`Error while getting activities order desc: ${err.message}`);
    return [null, err.message]; // for database error
  }
};
// getActivities

const updateActivity = async (activity, query) => {
  try {
    const data = await Activity.update(activity, {
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while updating activities: ${err.message}`);
    return [null, err.message]; // for database error
  }
};

const deleteActivity = async (query) => {
  try {
    const data = await Activity.destroy({
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting activities: ${err.message}`);
    return [null, err];
  }
};

const getActivitiesByType = async (activityQuery = {}, leadQuery = {}) => {
  try {
    const activities = await Activity.findAll({
      where: activityQuery,
      include: {
        model: Lead,
        where: leadQuery,
        //attributes: ['lead_id', 'user_id'],
        attributes: [],
      },
      attributes: [[sequelize.literal(`COUNT(activity_id)`), 'count'], 'type'],
      group: 'type',
    });
    // console.log(JSON.stringify(activities,null,4));
    return [JSON.parse(JSON.stringify(activities)), null];
  } catch (err) {
    logger.error(`Error while fetching activities by query: ${err.message}.`);
    return [null, err.message];
  }
};

const upsertActivity = async (activity) => {
  try {
    const upsertedActivity = await Activity.upsert(activity);
    return [upsertedActivity, null];
  } catch (err) {
    logger.error(`Error while upserting activity: ${err.message}`);
    return [null, err.message];
  }
};

const getActivityWithCadenceByQuery = async (query) => {
  try {
    const activity = await Activity.findOne({
      where: query,
      include: [{ model: Cadence }],
    });
    return [JSON.parse(JSON.stringify(activity)), null];
  } catch (err) {
    logger.error(
      `Error while getting activity with cadence by query: ${err.message}`
    );
    return [null, err.message]; // for database error
  }
};

// Sales Dailly activity followup

const getActivityStatisticsByUserid = async ({
  user_id,
  cadence_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const activity = await Activity.findAll({
      include: [
        {
          model: Lead,
          required: true,
          attributes: [],
          include: {
            model: User,
            required: true,
            attributes: [],
            where: {
              user_id: user_id,
            },
          },
        },
        {
          model: Cadence,
          required: true,
          attributes: ['name'],
          where: {
            cadence_id: cadence_id ?? { [Op.ne]: null },
          },
        },
      ],
      where: {
        // incoming: { [Op.ne]: null },
        type: {
          [Op.notIn]: [
            'launch_cadence',
            'pause_cadence',
            'unsubscribe',
            'resume_cadence',
          ],
        },
        // cadence_id: cadence_id ?? { [Op.ne]: null },
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
        [sequelize.literal(`COUNT(DISTINCT activity_id)`), 'activity_count'],
        'type',
        'cadence_id',
        'incoming',
        'cadence.name',
      ],
      group: ['incoming', 'type', 'cadence_id'],
      // group: ['type'],
      // raw: true,
    });
    // console.log(JsonHelper.parse(activity, null));
    return [JsonHelper.parse(activity), null];
  } catch (err) {
    logger.error(
      `Error while fetching activity statistics by user id: ${err.message}.`
    );
    return [null, err.message];
  }
};
// Group by cadence
const getActivityStatisticsByGroupId = async ({
  sd_id,
  cadence_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const activity = await Activity.findAll({
      include: [
        {
          model: Lead,
          required: true,
          attributes: [],
          include: {
            model: User,
            required: true,
            attributes: [],
            where: {
              sd_id: sd_id,
            },
          },
        },
        {
          model: Cadence,
          required: true,
          attributes: ['name'],
          where: {
            cadence_id: cadence_id ?? { [Op.ne]: null },
          },
        },
      ],
      where: {
        // incoming: { [Op.ne]: null },
        type: {
          [Op.notIn]: [
            'launch_cadence',
            'pause_cadence',
            'unsubscribe',
            'resume_cadence',
          ],
        },
        // cadence_id: cadence_id ?? { [Op.ne]: null },
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
        [sequelize.literal(`COUNT(DISTINCT activity_id)`), 'activity_count'],
        'type',
        'cadence_id',
        'incoming',
        'cadence.name',
      ],
      group: ['incoming', 'type', 'cadence_id'],
      // group: ['type'],
      // raw: true,
    });
    // console.log(JsonHelper.parse(activity, null));
    return [JsonHelper.parse(activity), null];
  } catch (err) {
    logger.error(`Error while fetching activity statistics by user id: `, err);
    return [null, err.message];
  }
};

// const startDate = moment(new Date(2018, 11, 24, 10, 33, 30, 0)).format(
//   'YYYY-MM-DD HH:mm:ss'
// );
// const endDate = moment(new Date(2022, 3, 24, 10, 33, 30, 0)).format(
//   'YYYY-MM-DD HH:mm:ss'
// );

// getActivityStatisticsByUserid({
//   start_date: '2018-11-24 10:33:30',
//   end_date: '2022-03-24 10:33:30',
//   user_id: '6838763f-231b-4ac7-88f2-1061e35ebc37',
// });

// Sales Daily activity followup Overall

const getAllActivityStatisticsForUser = async ({
  user_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const activity = await Activity.findAll({
      include: [
        {
          model: Lead,
          required: true,
          attributes: [],
          include: {
            model: User,
            required: true,
            attributes: ['first_name', 'last_name'],
            where: {
              user_id: user_id,
            },
          },
        },
      ],
      where: {
        incoming: { [Op.ne]: true },
        type: {
          [Op.notIn]: [
            'launch_cadence',
            'pause_cadence',
            'unsubscribe',
            'resume_cadence',
          ],
        },
        // cadence_id: cadence_id ?? { [Op.ne]: null },
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
        [sequelize.literal(`COUNT(DISTINCT activity_id)`), 'activity_count'],
        'type',
        'incoming',
        [sequelize.col('Lead.User.first_name'), 'first_name'],
        [sequelize.col('Lead.User.last_name'), 'last_name'],
        [sequelize.col('Lead.User.user_id'), 'user_id'],
      ],
      group: ['incoming', 'type'],
      // group: ['type'],
      // raw: true,
    });
    // console.log(JsonHelper.parse(activity, null));
    return [JsonHelper.parse(activity), null];
  } catch (err) {
    logger.error(
      `Error while fetching activity statistics by user id: ${err.message}.`
    );
    return [null, err.message];
  }
};

// getAllActivityStatisticsForUser({
//   start_date: '2018-11-24 10:33:30',
//   end_date: '2022-03-24 10:33:30',
//   user_id: '3',
// });

const getAllActivityStatisticsForGroup = async ({
  sd_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const activity = await Activity.findAll({
      include: [
        {
          model: Lead,
          required: true,
          attributes: [],
          include: {
            model: User,
            required: true,
            attributes: ['first_name', 'last_name'],
            where: {
              sd_id: sd_id,
            },
          },
        },
      ],
      where: {
        // incoming: { [Op.ne]: null },
        type: {
          [Op.notIn]: [
            'launch_cadence',
            'pause_cadence',
            'unsubscribe',
            'resume_cadence',
          ],
        },
        // cadence_id: cadence_id ?? { [Op.ne]: null },
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
        [sequelize.literal(`COUNT(DISTINCT activity_id)`), 'activity_count'],
        'type',
        'incoming',
        [sequelize.col('Lead.User.first_name'), 'first_name'],
        [sequelize.col('Lead.User.last_name'), 'last_name'],
        [sequelize.col('Lead.User.user_id'), 'user_id'],
      ],
      group: ['incoming', 'type', 'user_id'],
      // group: ['type'],
      // raw: true,
    });
    // console.log(JsonHelper.parse(activity, null));
    return [JsonHelper.parse(activity), null];
  } catch (err) {
    logger.error(`Error while fetching activity statistics by user id: `, err);
    return [null, err.message];
  }
};

// getAllActivityStatisticsForGroup({
//   start_date: '2018-11-24 10:33:30',
//   end_date: '2022-03-25 10:33:30',
//   sd_id: '4192bff0-e1e0-43ce-a4db-912808c32495',
// });

const getCallStatisticsByUserId = async ({
  user_id,
  cadence_id = null,
  start_date = null,
  end_date = null,
}) => {
  try {
    const activity = await Activity.findAll({
      include: [
        {
          model: Lead,
          required: true,
          attributes: [],
          include: {
            model: User,
            required: true,
            attributes: [],
            where: {
              user_id: user_id,
            },
          },
        },
        {
          model: Cadence,
          required: true,
          attributes: ['name'],
          where: {
            cadence_id: cadence_id ?? { [Op.ne]: null },
          },
        },
      ],
      where: {
        incoming: { [Op.ne]: null },
        type: 'call',
        // cadence_id: cadence_id ?? { [Op.ne]: null },
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
        [sequelize.literal(`COUNT(DISTINCT activity_id)`), 'call_count'],
        'cadence_id',
        'incoming',
        'cadence.name',
      ],
      group: ['cadence_id'],
      // group: ['type'],
      // raw: true,
    });
    // console.log(JsonHelper.parse(activity));
    return [JsonHelper.parse(activity), null];
  } catch (err) {
    logger.error(
      `Error while fetching call statistics by user id: ${err.message}.`
    );
    return [null, err.message];
  }
};

const ActivityRepository = {
  createActivity,
  createBulkActivity,
  getActivityById,
  getActivityByRingoverCallId,
  getActivities,
  updateActivity,
  deleteActivity,
  getActivityByQuery,
  getActivitiesByQuery,
  getSortedActivitiesByQuery,
  getActivitiesByType,
  upsertActivity,
  getActivityWithCadenceByQuery,
  getActivityStatisticsByUserid,
  getCallStatisticsByUserId,
  getAllActivityStatisticsForUser,
  getAllActivityStatisticsForGroup,
  getActivityStatisticsByGroupId,
};

module.exports = ActivityRepository;
