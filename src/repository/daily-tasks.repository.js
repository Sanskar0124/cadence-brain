// Utils
const logger = require('../utils/winston');
const {
  NODE_TYPES,
  CADENCE_STATUS,
  LEAD_STATUS,
  CADENCE_LEAD_STATUS,
  CUSTOM_TASK_NODE_ID,
  TASK_STATUSES,
} = require('../utils/enums');

// Packages
const { Op } = require('sequelize');

// Models
const {
  Daily_Tasks,
  Task,
  Lead,
  Account,
  Lead_phone_number,
  Node,
  Cadence,
  LeadToCadence,
  sequelize,
  Lead_email,
} = require('../db/models');

// Helpers and Services
const JsonHelper = require('../helper/json');

const createDailyTask = async (dailyTask) => {
  try {
    const createdDailyTask = await Daily_Tasks.create(dailyTask);

    return [JsonHelper.parse(createdDailyTask), null];
  } catch (err) {
    logger.error(`Error while creating daily task: ${err.message}.`);
    return [null, err.message];
  }
};

const createDailyTasks = async (dailyTasks) => {
  try {
    const createdDailyTasks = await Daily_Tasks.bulkCreate(dailyTasks);

    return [JsonHelper.parse(createdDailyTasks), null];
  } catch (err) {
    console.log(err?.errors);
    logger.error(`Error while creating daily tasks: ${err.message}.`);
    return [null, err.message];
  }
};

const deleteDailyTasksByQuery = async (query) => {
  try {
    const data = await Daily_Tasks.destroy({
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting daily tasks by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getDailyTasksForUser = async (
  user_id,
  filtersObject,
  lateSettings = {},
  order = []
) => {
  try {
    if (order?.length === 0)
      order = [
        [
          { model: Task },
          { model: Lead },
          { model: LeadToCadence },
          'lead_cadence_order',
          //'lead_id',
          'ASC',
        ],
        [
          { model: Task },
          { model: Lead },
          { model: LeadToCadence },
          'created_at',
          'ASC',
        ],
      ];
    let leadToCadenceQuery = {
      status: CADENCE_LEAD_STATUS.IN_PROGRESS,
    };
    let leadQuery = {
      status: {
        [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING],
      },
    };
    let cadenceQuery = {
      status: CADENCE_STATUS.IN_PROGRESS,
    };

    // if filtersObject has filter for task to fetch only completed tasks i.e. completed: 1
    // then check for lead_cadence_status to be CADENCE_LEAD_STATUS.IN_PROGRESS should not be there
    // as if task is completed then lead_cadence_status can be CADENCE_LEAD_STATUS.COMPLETED
    if (filtersObject?.task?.completed) {
      delete leadToCadenceQuery?.status;
      delete leadQuery?.status;
      delete cadenceQuery?.status;
    }

    const tasks = await Daily_Tasks.findAll({
      where: {
        user_id,
      },
      attributes: [],
      include: [
        {
          model: Node,
          where: {
            type: {
              [Op.not]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
                NODE_TYPES.AUTOMATED_REPLY_TO,
                NODE_TYPES.END,
              ],
            },
            ...filtersObject?.node,
          },
          required: true,
          attributes: [
            'node_id',
            'type',
            'step_number',
            'data',
            'next_node_id',
            'is_urgent',
            [
              sequelize.literal(`
              CASE 
                WHEN Task.late_time <= ${new Date().getTime()}
                  THEN 1
                  ELSE 0
              END
							`),
              'isLate',
            ],
          ],
        },
        {
          model: Task,
          where: {
            //start_time: {
            //[Op.lte]: new Date().getTime(),
            //},
            ...filtersObject?.task,
            node_id: {
              [Op.notIn]: Object.values(CUSTOM_TASK_NODE_ID),
            },
            to_show: true,
          },
          required: true,
          subQuery: false,
          attributes: [
            'task_id',
            'user_id',
            'name',
            'completed',
            'complete_time',
            'is_skipped',
            'start_time',
            'shown_time',
            'late_time',
            //[
            //sequelize.literal(
            //`CASE
            //WHEN NOT urgent_time=0
            //THEN
            //CASE
            //WHEN urgent_time < ${new Date().getTime()}
            //THEN 1
            //ELSE 0
            //END
            //ELSE 0
            //END`
            //),
            //'isUrgent',
            //],
            'created_at',
            'status',
          ],
          include: [
            {
              model: Lead,
              where: {
                ...filtersObject?.lead,
                ...leadQuery,
                //status: {
                //[Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING],
                //},
              },
              required: true,
              subQuery: false,
              attributes: [
                'first_name',
                'last_name',
                'lead_id',
                'job_position',
                'lead_warmth',
                'lead_score',
                'duplicate',
                'linkedin_url',
              ],
              include: [
                {
                  model: Account,
                  where: {
                    ...filtersObject?.account,
                  },
                  required: Object.keys(filtersObject?.account).length ?? true,
                  subQuery: false,
                  attributes: ['account_id', 'size', 'name'],
                },
                {
                  model: Lead_phone_number,
                  where: {
                    ...filtersObject.lead_phone_number,
                  },
                  required: filtersObject.lead_phone_number ? true : false,
                  attributes: [
                    'is_primary',
                    'time',
                    'timezone',
                    'phone_number',
                  ],
                },
                {
                  model: Lead_email,
                  attributes: ['is_primary', 'email_id'],
                },
                {
                  model: LeadToCadence,
                  subQuery: false,
                  where: {
                    cadence_id: {
                      [Op.eq]: sequelize.col('Task.cadence_id'),
                    },
                    //status: CADENCE_LEAD_STATUS.IN_PROGRESS,
                    ...leadToCadenceQuery,
                  },
                  required: true,
                  //attributes: ['lead_cadence_order', 'created_at'],
                  attributes: [],
                },
              ],
            },
            //{
            //model: Node,
            //where: {
            //type: {
            //[Op.not]: [
            //NODE_TYPES.AUTOMATED_MAIL,
            //NODE_TYPES.AUTOMATED_MESSAGE,
            // NODE_TYPES.AUTOMATED_REPLY_TO,
            //],
            //},
            //...filtersObject?.node,
            //},
            //required: true,
            ////subQuery: false,
            //attributes: [
            //'node_id',
            //'type',
            //'step_number',
            //'data',
            //'next_node_id',
            //'is_urgent',
            //],
            //},
            {
              model: Cadence,
              attributes: ['name', 'cadence_id'],
              where: {
                ...cadenceQuery,
                //status: CADENCE_STATUS.IN_PROGRESS,
              },
              include: [
                {
                  model: Node,
                  attributes: ['node_id'],
                },
              ],
            },
          ],
        },
      ],
      /**
       * * => Ordering by daily task id so that every time it's fetched in same order
       */
      order,
      //order: ['daily_task_id'],
      // logging: console.log,
    });

    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    logger.error(`Error while fetching daily tasks: ${err.message}.`);
    return [null, err.message];
  }
};

const getDailyTasksForUserWithNoNode = async (
  user_id,
  filtersObject,
  order = []
) => {
  try {
    if (order?.length === 0)
      order = [
        [
          { model: Task },
          { model: Lead },
          { model: LeadToCadence },
          'lead_cadence_order',
          'ASC',
        ],
        [
          { model: Task },
          { model: Lead },
          { model: LeadToCadence },
          'created_at',
          'ASC',
        ],
      ];
    const tasks = await Daily_Tasks.findAll({
      where: {
        user_id,
      },
      attributes: [],
      include: [
        {
          model: Node,
          where: {
            type: {
              [Op.not]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
                NODE_TYPES.AUTOMATED_REPLY_TO,
                NODE_TYPES.END,
              ],
            },
            ...filtersObject?.node,
          },
          required: true,
          attributes: [
            'node_id',
            'type',
            'step_number',
            'data',
            'next_node_id',
          ],
        },
        {
          model: Task,
          where: {
            ...filtersObject?.task,
            node_id: {
              [Op.in]: Object.values(CUSTOM_TASK_NODE_ID),
            },
            to_show: true,
          },
          required: true,
          subQuery: false,
          attributes: [
            'task_id',
            'user_id',
            'name',
            'created_at',
            'completed',
            'complete_time',
            'is_skipped',
            'start_time',
          ],
          include: [
            {
              model: Lead,
              required: true,
              subQuery: false,
              attributes: [
                'first_name',
                'last_name',
                'lead_id',
                'job_position',
                'duplicate',
                'linkedin_url',
              ],
              include: [
                {
                  model: Account,
                  where: {
                    ...filtersObject?.account,
                  },
                  required: Object.keys(filtersObject?.account).length ?? true,
                  subQuery: false,
                  attributes: ['account_id', 'size', 'name', 'phone_number'],
                },
                {
                  model: Lead_phone_number,
                  attributes: [
                    'is_primary',
                    'time',
                    'timezone',
                    'phone_number',
                  ],
                  where: {
                    ...filtersObject.lead_phone_number,
                  },
                  required: filtersObject.lead_phone_number ? true : false,
                },
                {
                  model: Lead_email,
                  attributes: ['is_primary', 'email_id'],
                },
                {
                  model: LeadToCadence,
                  attributes: [],
                },
              ],
            },
            {
              model: Cadence,
              attributes: ['name', 'cadence_id'],
              include: [
                {
                  model: Node,
                  attributes: ['node_id'],
                },
              ],
            },
            //{
            //model: Node,
            //where: {
            //type: {
            //[Op.not]: [
            //NODE_TYPES.AUTOMATED_MAIL,
            //NODE_TYPES.AUTOMATED_MESSAGE,
            // NODE_TYPES.AUTOMATED_REPLY_TO,
            //],
            //},
            //...filtersObject?.node,
            //},
            //subQuery: false,
            //attributes: [
            //'node_id',
            //'type',
            //'step_number',
            //'data',
            //'next_node_id',
            //],
            //},
          ],
        },
      ],
      order,
      //order: ['daily_task_id'],

      // logging: console.log,
    });

    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    logger.error(`Error while fetching daily tasks: ${err.message}.`);
    return [null, err.message];
  }
};

const getCompletedDailyTasks = async (
  user_id,
  filtersObject,
  lateSettings = {},
  order = [[{ model: Task }, 'complete_time', 'DESC']]
) => {
  try {
    const completedTasks = await Daily_Tasks.findAll({
      where: {
        user_id,
      },
      attributes: [],
      include: [
        {
          model: Node,
          where: {
            type: {
              [Op.not]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
                NODE_TYPES.AUTOMATED_REPLY_TO,
                NODE_TYPES.END,
              ],
            },
            ...filtersObject?.node,
          },
          required: true,
          attributes: [
            'node_id',
            'type',
            'step_number',
            'data',
            'next_node_id',
            'is_urgent',
            [sequelize.literal('0'), 'isLate'],
          ],
        },
        {
          model: Task,
          where: {
            ...filtersObject?.task,
            completed: 1, // will always fetch completed tasks
            to_show: true,
          },
          required: true,
          subQuery: false,
          attributes: [
            'task_id',
            'user_id',
            'name',
            'completed',
            'complete_time',
            'is_skipped',
            //[
            //sequelize.literal(
            //`CASE
            //WHEN NOT urgent_time=0
            //THEN
            //CASE
            //WHEN urgent_time < ${new Date().getTime()}
            //THEN 1
            //ELSE 0
            //END
            //ELSE 0
            //END`
            //),
            //'isUrgent',
            //],
            'status',
            'created_at',
          ],
          include: [
            {
              model: Lead,
              where: {
                ...filtersObject?.lead,
              },
              required: true,
              subQuery: false,
              attributes: [
                'first_name',
                'last_name',
                'lead_id',
                'lead_warmth',
                'lead_score',
                'job_position',
                'duplicate',
              ],
              include: [
                {
                  model: Account,
                  where: {
                    ...filtersObject?.account,
                  },
                  required: Object.keys(filtersObject?.account).length ?? true,
                  subQuery: false,
                  attributes: ['account_id', 'size', 'name'],
                },
                {
                  model: Lead_phone_number,
                  attributes: ['is_primary', 'time', 'timezone'],
                  where: {
                    ...filtersObject.lead_phone_number,
                  },
                  required: filtersObject.lead_phone_number ? true : false,
                },
              ],
            },
            //{
            //model: Node,
            //where: {
            //type: {
            //[Op.not]: [
            //NODE_TYPES.AUTOMATED_MAIL,
            //NODE_TYPES.AUTOMATED_MESSAGE,
            // NODE_TYPES.AUTOMATED_REPLY_TO,
            //],
            //},
            //...filtersObject?.node,
            //},
            ////required: true,
            //subQuery: false,
            //attributes: [
            //'node_id',
            //'type',
            //'step_number',
            //'data',
            //'next_node_id',
            //],
            //},
            {
              model: Cadence,
              attributes: ['name', 'cadence_id'],
              include: [
                {
                  model: Node,
                  attributes: ['node_id'],
                },
              ],
            },
          ],
        },
      ],
      /**
       * * => Ordering by daily task id so that every time it's fetched in same order
       */
      order,
      //order: ['daily_task_id'],
      //logging: console.log,
    });

    return [JsonHelper.parse(completedTasks), null];
  } catch (err) {
    logger.error(`Error while fetching completed daily tasks: ${err.message}.`);
    return [null, err.message];
  }
};

// * Fetch scheduled tasks
const getScheduledDailyTasks = async (
  user_id,
  filtersObject,
  lateSettings = {},
  order = [[{ model: Task }, 'complete_time', 'DESC']]
) => {
  try {
    const scheduledTasks = await Daily_Tasks.findAll({
      where: {
        user_id,
      },
      attributes: [],
      include: [
        {
          model: Node,
          where: {
            type: {
              [Op.not]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
                NODE_TYPES.AUTOMATED_REPLY_TO,
                NODE_TYPES.END,
              ],
            },
            ...filtersObject?.node,
          },
          required: true,
          attributes: [
            'node_id',
            'type',
            'step_number',
            'data',
            'next_node_id',
            'is_urgent',
            [sequelize.literal('0'), 'isLate'],
          ],
        },
        {
          model: Task,
          where: {
            ...filtersObject?.task,
            status: TASK_STATUSES.SCHEDULED, // will always fetch completed tasks
            to_show: true,
          },
          required: true,
          subQuery: false,
          attributes: [
            'task_id',
            'user_id',
            'name',
            'completed',
            'complete_time',
            'is_skipped',
            'status',
            'created_at',
            'start_time',
          ],
          include: [
            {
              model: Lead,
              where: {
                ...filtersObject?.lead,
              },
              required: true,
              subQuery: false,
              attributes: [
                'first_name',
                'last_name',
                'lead_id',
                'lead_warmth',
                'lead_score',
                'job_position',
                'duplicate',
              ],
              include: [
                {
                  model: Account,
                  where: {
                    ...filtersObject?.account,
                  },
                  required: Object.keys(filtersObject?.account).length ?? true,
                  subQuery: false,
                  attributes: ['account_id', 'size', 'name'],
                },
                {
                  model: Lead_phone_number,
                  attributes: ['is_primary', 'time', 'timezone'],
                  where: {
                    ...filtersObject.lead_phone_number,
                  },
                  required: filtersObject.lead_phone_number ? true : false,
                },
              ],
            },
            {
              model: Cadence,
              attributes: ['name', 'cadence_id'],
              include: [
                {
                  model: Node,
                  attributes: ['node_id'],
                },
              ],
            },
          ],
        },
      ],
      order,
      //order: ['daily_task_id'],
      // logging: console.log,
    });

    return [JsonHelper.parse(scheduledTasks), null];
  } catch (err) {
    logger.error(`Error while fetching completed daily tasks: ${err.message}.`);
    return [null, err.message];
  }
};

const DailyTasksRepository = {
  createDailyTask,
  createDailyTasks,
  deleteDailyTasksByQuery,
  getDailyTasksForUser,
  getDailyTasksForUserWithNoNode,
  getCompletedDailyTasks,
  getScheduledDailyTasks,
};

module.exports = DailyTasksRepository;
