// Utils
const logger = require('../utils/winston');
const {
  NODE_TYPES,
  LEAD_STATUS,
  TAG_NAME,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  CUSTOM_TASK_NODE_ID,
} = require('../utils/enums');
const {
  URGENT_TIME_DIFF_FOR_INBOUND,
  URGENT_TIME_DIFF_FOR_OUTBOUND,
} = require('../utils/constants');

// Packages
const moment = require('moment');
const { Op } = require('sequelize');

// Models
const {
  Task,
  Lead,
  Account,
  Node,
  sequelize,
  Cadence,
  Tag,
  Lead_phone_number,
  Lead_email,
  LeadToCadence,
  User,
  User_Token,
  Company,
  Daily_Tasks,
} = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const createTask = async (task) => {
  try {
    const createdTask = await Task.create(task);
    logger.info('Created Task: ' + JSON.stringify(createdTask, null, 4));
    return [createdTask, null];
  } catch (err) {
    logger.error(`Error while creating task: ${err.message}.`);
    return [null, err.message];
  }
};

const getTask = async (query, raw = true) => {
  try {
    const task = await Task.findOne({
      where: query,
      raw,
      include: [Node],
    });

    return [task, null];
  } catch (err) {
    logger.error(`Error while fetching task: ${err.message}.`);
    return [null, err.message];
  }
};

const getTasks = async (query) => {
  try {
    const tasks = await Task.findAll({
      where: query,
      include: [
        { model: Node },
        { model: Cadence, include: Node },
        { model: Lead },
      ],
      order: [['task_id', 'DESC']],
    });

    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    logger.error(`Error while fetching tasks: ${err.message}.`);
    return [null, err.message];
  }
};

const getTasksByQuery = async (query, nodeQuery = {}) => {
  try {
    const tasks = await Task.findAll({
      where: query,
      include: [
        { model: Node, where: nodeQuery, required: true },
        { model: Cadence, include: Node },
        { model: Lead, include: Account },
      ],
    });

    return [JSON.parse(JSON.stringify(tasks)), null];
  } catch (err) {
    logger.error(`Error while fetching tasks: ${err.message}.`);
    return [null, err.message];
  }
};

const updateTask = async (query, task) => {
  try {
    const data = await Task.update(task, {
      where: query,
    });
    console.log(data);

    return [data, null];
  } catch (err) {
    logger.error(`Error while updating task: ${err.message}.`);
    return [null, err.message];
  }
};

const updateTasks = async (query, task) => {
  try {
    const data = await Task.update(task, {
      where: query,
    });
    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(`Error while updating task: ${err.message}.`);
    return [null, err.message];
  }
};

const deleteTasksByQuery = async (query) => {
  try {
    const data = await Task.destroy({ where: query });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting task: ${err.message}.`);
    return [null, err.message];
  }
};

const getPendingTasks = async (
  taskQuery,
  nodeQuery,
  cadencePriority,
  filterArray
) => {
  try {
    if (!taskQuery) return [null, `Please provide taskQuery.`];

    if (filterArray?.length === 0) filterArray = [['task_id', 'ASC']];
    else filterArray = [filterArray];

    const tasks = await Task.findAll({
      where: taskQuery,
      attributes: ['task_id', 'user_id', 'name', 'created_at'],
      include: [
        {
          model: Cadence,
          where: {
            priority: cadencePriority,
            status: CADENCE_STATUS.IN_PROGRESS,
          },
          required: true,
          subQuery: false,
          include: [
            {
              model: Node,
              subQuery: false,
              attributes: ['node_id'],
            },
            {
              model: Tag,
              subQuery: false,
              attributes: [
                // include: [
                [
                  // * for checking if task is urgent or not
                  sequelize.literal(
                    `CASE
                          when tag_name="${TAG_NAME.INBOUND}"
                            THEN
                              CASE WHEN start_time + ${
                                URGENT_TIME_DIFF_FOR_INBOUND * 60 * 60 * 1000
                              } < ${new Date().getTime()}
                                then 1
                                ELSE 0
                              END
                            ELSE
                              CASE WHEN tag_name="${TAG_NAME.OUTBOUND}"
                                THEN
                                  CASE WHEN start_time + ${
                                    URGENT_TIME_DIFF_FOR_OUTBOUND *
                                    60 *
                                    60 *
                                    1000
                                  } < ${new Date().getTime()}
                                    then 1
                                    ELSE 0
                                  END
                                ELSE 0
                              END
                        END`
                  ),
                  'isUrgent',
                ],
                'tag_name',
                // ],
              ],
            },
          ],

          attributes: ['name', 'cadence_id'],
        },
        {
          model: Lead,
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING], // * Tasks for leads with status of 'new_lead' and 'ongoing'
            },
          },
          attributes: ['first_name', 'last_name', 'lead_id', 'job_position'],
          required: true,
          include: [
            {
              model: Account,
              attributes: ['account_id', 'size', 'name'],
            },
            {
              model: LeadToCadence,
              subQuery: false,
              where: {
                cadence_id: {
                  [Op.eq]: sequelize.col('Task.cadence_id'),
                },
                status: CADENCE_LEAD_STATUS.IN_PROGRESS,
              },
              required: true,
              attributes: ['lead_cadence_order', 'created_at'],
            },
            {
              model: Lead_phone_number,
              attributes: ['is_primary', 'time', 'timezone'],
            },
          ],
        },
        {
          model: Node,
          subQuery: false,
          where: nodeQuery,
          required: true,
          attributes: ['node_id', 'type', 'step_number', 'data'],
        },
      ],

      order: filterArray,
      //limit,
      // logging: console.log,
    });
    // console.log(JSON.stringify(tasks, null, 4));
    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while fetching pending tasks: ${err.message}.`);
    return [null, err.message];
  }
};

const getCountForPendingTasks = async (user_id) => {
  try {
    // * get count for pending tasks
    const tasks = await Task.count({
      where: {
        user_id,
        completed: 0, // * not yet completed
        is_skipped: 0, // * not skipped
        start_time: {
          [Op.lte]: new Date().getTime(), // * time is less than or equal to current time
        },
      },
      include: [
        {
          model: Cadence,
          where: {
            status: CADENCE_STATUS.IN_PROGRESS, // * cadence to which it belongs should be in progress
          },
          attributes: ['status', 'cadence_id'],
        },
        {
          model: Lead,
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING], // * Tasks for leads with status of 'new_lead' and 'ongoing'
            },
            stopped_cadence: 0,
          },
          attributes: ['status', 'stopped_cadence', 'lead_id'],
        },
        {
          model: Node,
          where: {
            type: {
              [Op.notIn]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
              ],
            },
          },
          attributes: ['type', 'node_id'],
        },
      ],
    });

    return [tasks, null];
  } catch (err) {
    logger.error(
      `Error while fetching count for pending tasks: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getLastTaskForLead = async (query) => {
  try {
    const lastTask = await Task.findAll({
      where: query,
      include: [
        {
          model: Node,
        },
        {
          model: Lead,
        },
        {
          model: Cadence,
        },
      ],
      order: [
        ['created_at', 'DESC'], // * get most recently created task
      ],
    });

    return [JSON.parse(JSON.stringify(lastTask)), null];
  } catch (err) {
    logger.error(`Error while fetching last task for a lead: ${err.message}.`);
    return [null, err.message];
  }
};

const fetchTaskWithNoNode = async (taskQuery, filterArray) => {
  try {
    /**
     * * taskQuery
        user_id,
        node_id: {
        	[Op.in]: Object.values(CUSTOM_TASK_NODE_ID),
        },
        completed: 0, // * not yet completed
        start_time: {
          [Op.lte]: new Date().getTime(), // * time is less than or equal to current time
        },
     */
    if (!taskQuery) return [null, `Please provide taskQuery.`];

    const tasks = await Task.findAll({
      where: taskQuery,
      include: [
        {
          model: Lead,
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING], // * Tasks for leads with status of 'new_lead' and 'ongoing'
            },
          },
          include: {
            model: Account,
          },
        },
      ],
      order: filterArray.length ? [filterArray] : [],
    });

    return [JSON.parse(JSON.stringify(tasks)), null];
  } catch (err) {
    logger.error(`Error while fetching tasks with no nodes: ${err.message}.`);
    return [null, err.message];
  }
};

const getTasksByType = async (query) => {
  try {
    const tasks = await Task.findAll({
      where: query,
      include: {
        model: Node,
        where: {
          type: {
            [Op.in]: [NODE_TYPES.CALL, NODE_TYPES.MESSAGE, NODE_TYPES.MAIL],
          },
        },
        attributes: ['type'],
      },
      attributes: [
        [sequelize.literal('COUNT(Node.type)'), 'count'],
        'Node.type',
      ],
      group: ['Node.type'],
      // logging: console.log,
    });

    return [tasks, null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while fetching tasks with type: ${err.message}.`);
  }
};

const getCountForUserTasks = async (query, nodeQuery = {}) => {
  try {
    const tasks = await Task.count({
      where: query,
      include: {
        model: Node,
        where: nodeQuery,
        required: true,
      },
      // logging: console.log,
    });
    return [tasks, null];
  } catch (err) {
    logger.error(`Error while fetching count for user task's: ${err.message}.`);
    return [null, err.message];
  }
};

const getLastTaskForUser = async (query) => {
  try {
    const lastTask = await Task.findOne({
      where: query,
      include: {
        model: Node,
        where: {
          type: NODE_TYPES.AUTOMATED_MAIL,
        },
      },
      order: [['start_time', 'DESC']],
    });

    return [lastTask, null];
  } catch (err) {
    logger.error(`Error while fetching last task: ${err.message}.`);
    return [null, err.message];
  }
};

const getTasksInPriority = async (taskQuery, cadencePriority, filterArray) => {
  try {
    /**
     * * taskQuery
        user_id,
        completed: 0, // * not yet completed
        is_skipped: 0,
        start_time: {
          [Op.lte]: new Date().getTime(), // * time is less than or equal to current time
        },
     */
    // * If filterArray exists, add lead_to_cadence ordering.
    // filterArray = [
    //   [{ model: Cadence }, 'created_at', 'ASC'],
    //   [{ model: Lead }, 'created_at', 'ASC'],
    // ];

    if (!taskQuery) return [null, `Please provide taskQuery.`];

    if (filterArray?.length === 0)
      filterArray = [
        [
          { model: Lead },
          { model: LeadToCadence },
          'lead_cadence_order',
          'ASC',
        ],
        [{ model: Lead }, { model: LeadToCadence }, 'created_at', 'ASC'],
      ];
    else filterArray = [filterArray];

    const tasks = await Task.findAll({
      where: {
        ...taskQuery,
        node_id: {
          [Op.notIn]: Object.values(CUSTOM_TASK_NODE_ID),
        },
      },
      attributes: ['task_id', 'user_id', 'name', 'created_at'],
      include: [
        {
          model: Cadence,
          where: {
            priority: cadencePriority,
            status: CADENCE_STATUS.IN_PROGRESS,
          },
          required: true,
          subQuery: false,
          include: [
            {
              model: Node,
              subQuery: false,
              attributes: ['node_id'],
            },
            {
              model: Tag,
              subQuery: false,
              attributes: [
                // include: [
                [
                  // * for checking if task is urgent or not
                  sequelize.literal(
                    `CASE
                          when tag_name="${TAG_NAME.INBOUND}"
                            THEN
                              CASE WHEN start_time + ${
                                URGENT_TIME_DIFF_FOR_INBOUND * 60 * 60 * 1000
                              } < ${new Date().getTime()}
                                then 1
                                ELSE 0
                              END
                            ELSE
                              CASE WHEN tag_name="${TAG_NAME.OUTBOUND}"
                                THEN
                                  CASE WHEN start_time + ${
                                    URGENT_TIME_DIFF_FOR_OUTBOUND *
                                    60 *
                                    60 *
                                    1000
                                  } < ${new Date().getTime()}
                                    then 1
                                    ELSE 0
                                  END
                                ELSE 0
                              END
                        END`
                  ),
                  'isUrgent',
                ],
                'tag_name',
                // ],
              ],
            },
          ],

          attributes: [
            'name',
            'cadence_id',
            // 'status',
            // 'priority',
            //'created_at',
          ],
        },
        {
          model: Lead,
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING], // * Tasks for leads with status of 'new_lead' and 'ongoing'
            },
          },
          attributes: ['first_name', 'last_name', 'lead_id', 'job_position'],
          required: true,
          include: [
            {
              model: Account,
              attributes: ['account_id', 'size', 'name'],
            },
            {
              model: LeadToCadence,
              subQuery: false,
              where: {
                cadence_id: {
                  [Op.eq]: sequelize.col('Task.cadence_id'),
                },
                status: CADENCE_LEAD_STATUS.IN_PROGRESS,
              },
              required: true,
              attributes: [],
            },
            {
              model: Lead_phone_number,
              attributes: ['is_primary', 'time', 'timezone'],
            },
          ],
        },
        {
          model: Node,
          subQuery: false,
          where: {
            type: {
              [Op.notIn]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
              ],
            },
          },
          required: true,
          attributes: ['node_id', 'type', 'step_number', 'data'],
        },
      ],

      order: filterArray,
      //limit,
      // logging: console.log,
    });
    // console.log(JSON.stringify(tasks, null, 4));
    return [JSON.parse(JSON.stringify(tasks)), null];
  } catch (err) {
    logger.error(`Error while fetching tasks in priority: ${err.message}.`);
    return [null, err.message];
  }
};

const getTasksByNodeQuery = async (query, nodeQuery) => {
  try {
    // * Fetch count of multiple tasks
    const tasks = await Task.findAll({
      where: query,
      include: [
        {
          model: Node,
          where: nodeQuery,
        },
      ],
    });

    return [tasks, null];
  } catch (err) {
    logger.error(
      `Error while fetching count for tasks by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const countTasks = async (query) => {
  try {
    let count = await Task.count({
      where: query,
    });
    return [count, null];
  } catch (err) {
    logger.error(`Error while fetching count for tasks: ${err.message}.`);
    return [null, err.message];
  }
};

const getTasksByCadenceAndNode = async (
  taskQuery = {},
  cadenceQuery = {},
  nodeQuery = {}
) => {
  try {
    const tasks = await Task.findAll({
      where: taskQuery,
      include: [
        {
          model: Cadence,
          where: cadenceQuery,
          attributes: ['priority'],
        },
        {
          model: Node,
          where: nodeQuery,
          attributes: [],
        },
      ],

      attributes: [[sequelize.literal(`COUNT(*)`), 'count']],
      group: ['priority'],
    });

    // console.log(JSON.stringify(tasks, null, 4));

    return [JSON.parse(JSON.stringify(tasks)), null];
  } catch (err) {
    logger.error(
      `Error while fetching tasks with cadence query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getTasksForLeaderboardGraph = async (query) => {
  try {
    const tasks = await Task.findAll({
      where: query,
      raw: true,
      include: [{ model: Node }, { model: Cadence }, { model: Lead }],
    });

    return [tasks, null];
  } catch (err) {
    logger.error(
      `Error while fetching tasks for leaderboard graph: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getTasksWithLimitAndOffset = async (query, limit = 0, offset = 0) => {
  try {
    const tasks = await Task.findAll({
      where: query,
      limit,
      offset,
    });

    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    logger.error(
      `Error while fetching tasks with limit and offset: ${err.message}.`
    );
    return [null, err.message];
  }
};

// Sales Daily activity followup

const getCustomTaskForUser = async ({
  user_id,
  cadence_id = null,
  start_date = null,
  end_date = null,
}) => {
  try {
    const taskCount = await Task.count({
      where: {
        user_id: user_id,
        // node_id: [1, 2, 3, 4],
        completed: true,
        // cadence_id: cadence_id ?? { [Op.ne]: null },
        complete_time: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).valueOf(),
            end_date ?? moment(new Date(2030, 3, 24, 10, 33, 30, 0)).valueOf(),
          ],
        },
      },
      include: {
        model: Node,
        attributes: [],
        where: {
          type: NODE_TYPES.CADENCE_CUSTOM,
        },
      },
      // logging: console.log,
      col: 'task_id',
      group: ['cadence_id'],
    });

    // console.log(taskCount);
    return [taskCount, null];
  } catch (err) {
    logger.error(
      `Error while fetching completed custom task count for user: ${err.message}.`
    );
    return [null, err.message];
  }
};
// getCustomTaskForUser({ user_id: ['6838763f-231b-4ac7-88f2-1061e35ebc37'] });

const getCustomTaskForCadenceByGroup = async ({
  sd_id,
  cadence_id = null,
  start_date = null,
  end_date = null,
}) => {
  try {
    const taskCount = await Task.count({
      where: {
        // node_id: [1, 2, 3, 4],
        completed: true,
        // cadence_id: cadence_id ?? { [Op.ne]: null },
        complete_time: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).valueOf(),
            end_date ?? moment(new Date(2030, 3, 24, 10, 33, 30, 0)).valueOf(),
          ],
        },
      },
      include: [
        {
          model: Node,
          attributes: [],
          where: {
            type: NODE_TYPES.CADENCE_CUSTOM,
          },
        },
        {
          model: User,
          attributes: [],
          where: {
            sd_id: sd_id,
          },
        },
      ],
      // logging: console.log,
      col: 'task_id',
      group: ['cadence_id'],
    });

    // console.log(taskCount);
    return [taskCount, null];
  } catch (err) {
    logger.error(
      `Error while fetching completed custom task count for user: `,
      err
    );
    return [null, err.message];
  }
};

// getCustomTaskForCadenceByGroup({
//   sd_id: '4192bff0-e1e0-43ce-a4db-912808c32495',
// });
const getCompletedCustomTaskCountForUser = async ({
  user_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const taskCount = await Task.count({
      where: {
        user_id: user_id,
        // node_id: [1, 2, 3, 4],
        completed: true,
        // cadence_id: cadence_id ?? { [Op.ne]: null },
        complete_time: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).valueOf(),
            end_date ?? moment(new Date(2030, 3, 24, 10, 33, 30, 0)).valueOf(),
          ],
        },
      },
      include: {
        model: Node,
        attributes: [],
        where: {
          type: NODE_TYPES.CADENCE_CUSTOM,
        },
      },
      // logging: console.log,
      col: 'task_id',
    });

    // console.log(taskCount);
    return [taskCount, null];
  } catch (err) {
    logger.error(
      `Error while fetching completed custom task count for user: ${err.message}.`
    );
    return [null, err.message];
  }
};

// getCompletedCustomTaskCountForUser({
//   user_id: ['3'],
// });

const getCompletedCustomTaskCountForGroup = async ({
  sd_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const taskCount = await Task.findAll({
      where: {
        // node_id: [1, 2, 3, 4],
        completed: true,
        // cadence_id: cadence_id ?? { [Op.ne]: null },
        complete_time: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).valueOf(),
            end_date ?? moment(new Date(2030, 3, 24, 10, 33, 30, 0)).valueOf(),
          ],
        },
      },
      include: [
        {
          model: Node,
          attributes: [],
          where: {
            type: NODE_TYPES.CADENCE_CUSTOM,
          },
        },
        {
          model: User,
          attributes: [],
          where: {
            sd_id: sd_id,
          },
        },
      ],
      // logging: console.log,
      attributes: [
        [sequelize.literal(`COUNT(DISTINCT task_id)`), 'count'],
        'user_id',
        'user.first_name',
        'user.last_name',
      ],
      group: ['user_id'],
      raw: true,
    });

    // console.log(JsonHelper.parse(taskCount));
    return [taskCount, null];
  } catch (err) {
    logger.error(
      `Error while fetching completed custom task count for user: `,
      err
    );
    return [null, err.message];
  }
};
// getCompletedCustomTaskCountForGroup({
//   sd_id: '4192bff0-e1e0-43ce-a4db-912808c32495',
//   start_date: 1543035810000,
//   end_date: 1648184610000,
// });

// Cadence task followup
const getCompletedTaskCountByUserForCadence = async ({
  cadence_id,
  user_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const taskCount = await Task.findAll({
      where: {
        cadence_id: cadence_id ?? { [Op.ne]: null },
        completed: true,
        complete_time: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).valueOf(),
            end_date ?? moment(new Date(2030, 3, 24, 10, 33, 30, 0)).valueOf(),
          ],
        },
      },
      include: [
        {
          model: User,
          where: { user_id: user_id ?? { [Op.ne]: null } },
          attributes: ['first_name', 'last_name'],
        },
        {
          model: Node,
          attributes: [],
          required: true,
          where: {
            type: {
              [Op.notIn]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
              ],
            },
          },
        },
      ],
      attributes: [
        // [sequelize.literal(`COUNT(task_id)`), 'count'],
        [sequelize.literal(`COUNT(DISTINCT(task_id))`), 'completed_task_count'],
        'user_id',
        'cadence_id',
        [sequelize.col('User.first_name'), 'first_name'],
        [sequelize.col('User.last_name'), 'last_name'],
      ],
      group: ['user_id', 'cadence_id'],
      raw: true,
      // logging: console.log,
    });
    // console.log(JsonHelper.parse(taskCount));

    return [JsonHelper.parse(taskCount), null];
  } catch (err) {
    logger.error(
      `Error while fetching completed task count for user : ${err.message}.`
    );
    return [null, err.message];
  }
};

// getCompletedTaskCountByUserForCadence(105, [
//   '6838763f-231b-4ac7-88f2-1061e35ebc37',
//   '53d7edd9-4628-4472-ab3f-64086b367aeb',
// ]);

// getCompletedTaskCountByUserForCadence({
//   user_id: [
//     '6838763f-231b-4ac7-88f2-1061e35ebc37',
//     '53d7edd9-4628-4472-ab3f-64086b367aeb',
//   ],
// });

// Cadence Activity : Get Completed custom task by user for each cadence pass null for all cadences

const getCompletedCustomTaskCountForCadence = async ({
  cadence_id,
  user_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const taskCount = await Task.findAll({
      where: {
        cadence_id: cadence_id ?? { [Op.ne]: null },
        completed: true,
        // node_id: [1, 2, 3, 4],
        complete_time: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).valueOf(),
            end_date ?? moment(new Date(2030, 3, 24, 10, 33, 30, 0)).valueOf(),
          ],
        },
      },
      include: [
        {
          model: User,
          where: { user_id: user_id ?? { [Op.ne]: null } },
          attributes: [],
        },
        {
          model: Cadence,
          attributes: ['name'],
        },
        {
          model: Node,
          attributes: [],
          where: {
            type: NODE_TYPES.CADENCE_CUSTOM,
          },
        },
      ],
      attributes: [
        // [sequelize.literal(`COUNT(task_id)`), 'count'],
        [sequelize.literal(`COUNT(distinct(task_id))`), 'completed_task_count'],
        'cadence_id',
        [sequelize.col('Cadence.name'), 'name'],
      ],
      group: ['cadence_id'],
      raw: true,
    });
    // console.log(JsonHelper.parse(taskCount));

    return [JsonHelper.parse(taskCount), null];
  } catch (err) {
    logger.error(
      `Error while fetching completed custom task count by user for cadence : ${err.message}.`
    );
    return [null, err.message];
  }
};

// getCompletedCustomTaskCountForCadence({
//   user_id: ['d7b7301b-9261-4c6d-a4b6-41a7fb23182a'],
// });

// Cadence step performing analyse

const getCompletedCustomTaskCountForGroupByCadence = async ({
  cadence_id,
  sd_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const taskCount = await Task.findAll({
      where: {
        cadence_id: cadence_id ?? { [Op.ne]: null },
        completed: true,
        // node_id: [1, 2, 3, 4],
        complete_time: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).valueOf(),
            end_date ?? moment(new Date(2030, 3, 24, 10, 33, 30, 0)).valueOf(),
          ],
        },
      },
      include: [
        {
          model: User,
          where: { sd_id: sd_id ?? { [Op.ne]: null } },
          attributes: [],
        },
        {
          model: Cadence,
          attributes: ['name'],
        },
        {
          model: Node,
          attributes: [],
          where: {
            type: NODE_TYPES.CADENCE_CUSTOM,
          },
        },
      ],
      attributes: [
        // [sequelize.literal(`COUNT(task_id)`), 'count'],
        [sequelize.literal(`COUNT(distinct(task_id))`), 'completed_task_count'],
        'cadence_id',
        [sequelize.col('Cadence.name'), 'name'],
      ],
      group: ['cadence_id'],
      raw: true,
    });
    // console.log(JsonHelper.parse(taskCount));

    return [JsonHelper.parse(taskCount), null];
  } catch (err) {
    logger.error(
      `Error while fetching completed custom task count by user for cadence : `,
      err
    );
    return [null, err.message];
  }
};

const getCompletedTaskByNode = async ({
  node_id,
  node_type = null,
  user_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const taskCount = await Task.findAll({
      where: {
        completed: true,
        node_id: node_id,
        complete_time: {
          [Op.between]: [
            start_date ??
              moment(new Date(2018, 11, 24, 10, 33, 30, 0)).valueOf(),
            end_date ?? moment(new Date(2030, 3, 24, 10, 33, 30, 0)).valueOf(),
          ],
        },
      },
      include: [
        {
          model: User,
          where: { user_id: user_id ?? { [Op.ne]: null } },
          attributes: [],
        },
        {
          model: Cadence,
          attributes: ['name'],
        },
        {
          model: Node,
          attributes: ['name'],
          where: {
            type: node_type ?? { [Op.ne]: null },
          },
        },
      ],
      attributes: [
        // [sequelize.literal(`COUNT(task_id)`), 'count'],
        [sequelize.literal(`COUNT(distinct(task_id))`), 'completed_task_count'],
        'cadence_id',
        [sequelize.col('Cadence.name'), 'name'],
      ],
      group: ['cadence_id'],
      raw: true,
    });
    // console.log(JsonHelper.parse(taskCount));

    return [JsonHelper.parse(taskCount), null];
  } catch (err) {
    logger.error(
      `Error while fetching completed custom task count by user for cadence : ${err.message}.`
    );
    return [null, err.message];
  }
};

/*
 * getTasksNotInDailyTasks return tasks whose start time lies in the next minute and are not present in daily tasks
 * but can be added to daily tasks.
 * return data as {user_id,count(count of tasks) }
 *
 * */
const getTasksNotInDailyTasks = async (query) => {
  try {
    const tasks = await Task.findAll({
      where: {
        ...query,
        '$Daily_Task.daily_task_id$': null, // want this to be always true
      },
      attributes: [[sequelize.literal('COUNT(*)'), 'count'], 'user_id'],
      include: [
        {
          model: Cadence,
          where: {
            status: CADENCE_STATUS.IN_PROGRESS,
          },
          required: true,
          subQuery: false,
          attributes: [],
        },
        {
          model: Lead,
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING], // * Tasks for leads with status of 'new_lead' and 'ongoing'
            },
          },
          attributes: [],
          required: true,
          include: [
            {
              model: LeadToCadence,
              subQuery: false,
              where: {
                cadence_id: {
                  [Op.eq]: sequelize.col('Task.cadence_id'),
                },
                status: CADENCE_LEAD_STATUS.IN_PROGRESS,
              },
              required: true,
              attributes: [],
            },
          ],
        },
        {
          model: Node,
          subQuery: false,
          where: {
            type: {
              [Op.notIn]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
              ],
            },
          },
          required: true,
          attributes: [],
        },
        {
          model: Daily_Tasks,
          attributes: [],
        },
      ],
      group: ['user_id'],
      //logging: console.log,
    });

    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    logger.error(
      `Error while fetching tasks not in daily tasks: ${err.message}.`
    );
    return [null, err.message];
  }
};

/*
 * getTasksNotInDailyTasks return tasks whose start time lies in the next minute and are not present in daily tasks
 * but can be added to daily tasks.
 * return data as {user_id,count(count of tasks) }
 *
 * */
const getTasksWithNoNodeNotInDailyTasks = async (query) => {
  try {
    const customTasks = await Task.findAll({
      where: {
        ...query,
        node_id: 0, // for custom task
        node_id: {
          [Op.in]: Object.values(CUSTOM_TASK_NODE_ID),
        },
        '$Daily_Task.daily_task_id$': null, // want this to be always true
      },
      attributes: [[sequelize.literal('COUNT(*)'), 'count'], 'user_id'],
      include: [
        {
          model: Lead,
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING], // * Tasks for leads with status of 'new_lead' and 'ongoing'
            },
          },
          attributes: [],
          required: true,
        },
        {
          model: Daily_Tasks,
          attributes: [],
        },
      ],
      group: ['user_id'],
      //logging: console.log,
    });

    return [JsonHelper.parse(customTasks), null];
  } catch (err) {
    logger.error(
      `Error while fetching tasks not in daily tasks: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getAutomatedTasksForCron = async (
  taskQuery,
  nodeQuery,
  userTokenQuery,
  order,
  extras
) => {
  try {
    let tasks = await Task.findAll({
      where: taskQuery,
      include: [
        {
          model: User,
          subQuery: false,
          required: true,
          include: [
            {
              model: User_Token,
              where: userTokenQuery,
              subQuery: false,
              required: true,
            },
            {
              model: Company,
            },
          ],
        },
        {
          model: Cadence,
          where: {
            status: CADENCE_STATUS.IN_PROGRESS,
            // cadence_id: 30020,
          },
          required: true,
          subQuery: false,
          attributes: [
            'name',
            'cadence_id',
            'status',
            'priority',
            'created_at',
          ],
        },
        {
          model: Lead,
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING], // * Tasks for leads with status of 'new_lead' and 'ongoing'
            },
          },
          required: true,
          subQuery: false,

          attributes: [
            'lead_id',
            'first_name',
            'last_name',
            'user_id',
            'email',
            'status',
          ],
          include: [
            {
              model: Account,
            },
            {
              model: LeadToCadence,
              subQuery: false,
              where: {
                cadence_id: {
                  [Op.eq]: sequelize.col('Task.cadence_id'),
                },
                status: CADENCE_LEAD_STATUS.IN_PROGRESS,
              },
              required: true,
            },
            {
              model: User,
            },
          ],
        },
        {
          model: Node,
          subQuery: false,
          where: nodeQuery,
          required: true,
          attributes: ['type', 'node_id'],
        },
      ],
      order,
      ...extras,
      //logging: console.log,
    });

    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    logger.error(
      `Error while fetching automated tasks for cron: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getTasksByQueryInOrder = async (query, order) => {
  try {
    let orderQuery = {};

    if (order)
      orderQuery = {
        order,
      };
    const tasks = await Task.findAll({
      where: query,
      ...orderQuery,
    });

    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    logger.error(`Error while fetching tasks by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getTasksCountForPriorityAndType = async (
  taskQuery = {},
  cadenceQuery = {},
  nodeQuery = {}
) => {
  try {
    const tasks = await Task.findAll({
      where: taskQuery,
      include: [
        {
          model: Cadence,
          where: cadenceQuery,
          attributes: ['priority'],
        },
        {
          model: Node,
          where: nodeQuery,
          attributes: ['type'],
        },
      ],

      attributes: [[sequelize.literal(`COUNT(*)`), 'count']],
      group: ['priority', 'Node.type'],
    });

    //console.log(JSON.stringify(tasks, null, 4));

    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    logger.error(
      `Error while fetching tasks with cadence query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getTasksFromDailyTasks = async (
  user_id,
  filtersObject,
  lateSettings = {},
  order = []
) => {
  try {
    if (order?.length === 0)
      order = [
        [
          { model: Lead },
          { model: LeadToCadence },
          'lead_cadence_order',
          //'lead_id',
          'ASC',
        ],
        [{ model: Lead }, { model: LeadToCadence }, 'created_at', 'ASC'],
      ];
    const tasks = await Task.findAll({
      where: {
        user_id,
        ...filtersObject?.task,
        node_id: {
          [Op.notIn]: Object.values(CUSTOM_TASK_NODE_ID),
        },
      },
      attributes: [
        'task_id',
        'user_id',
        'name',
        'completed',
        'complete_time',
        'is_skipped',
        'start_time',
        [
          sequelize.literal(
            `CASE
    WHEN NOT urgent_time=0
    THEN
    CASE
    WHEN urgent_time < ${new Date().getTime()}
    THEN 1
    ELSE 0
    END
    ELSE 0
    END`
          ),
          'isUrgent',
        ],
        'created_at',
      ],
      include: [
        {
          model: Daily_Tasks,
          required: true,
          subQuery: false,
        },
        {
          model: Lead,
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING],
            },
          },
          required: true,
          subQuery: false,
          attributes: [
            'first_name',
            'last_name',
            'lead_id',
            'job_position',
            'duplicate',
          ],
          include: [
            {
              model: Account,
              where: {
                ...filtersObject?.account,
              },
              required: true,
              subQuery: false,
              attributes: ['account_id', 'size', 'name'],
            },
            {
              model: Lead_phone_number,
              attributes: ['is_primary', 'time', 'timezone'],
            },
            {
              model: LeadToCadence,
              subQuery: false,
              where: {
                cadence_id: {
                  [Op.eq]: sequelize.col('Task.cadence_id'),
                },
                status: CADENCE_LEAD_STATUS.IN_PROGRESS,
              },
              required: true,
              //attributes: ['lead_cadence_order', 'created_at'],
              attributes: [],
            },
          ],
        },
        {
          model: Node,
          where: {
            type: {
              [Op.not]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
              ],
            },
            ...filtersObject?.node,
          },
          required: true,
          //subQuery: false,
          attributes: [
            'node_id',
            'type',
            'step_number',
            'data',
            'next_node_id',
            'is_urgent',
            [
              sequelize.literal(
                `CASE 
                  	WHEN Node.type='${NODE_TYPES.CALL}' and Task.start_time + ${
                  lateSettings[NODE_TYPES.CALL] || 0
                } < ${new Date().getTime()}
                    THEN  1
		 WHEN Node.type='${NODE_TYPES.MAIL}' and Task.start_time + ${
                  lateSettings[NODE_TYPES.MAIL] || 0
                } < ${new Date().getTime()}
                    THEN  1
		 WHEN Node.type='${NODE_TYPES.MESSAGE}' and Task.start_time + ${
                  lateSettings[NODE_TYPES.MESSAGE] || 0
                } < ${new Date().getTime()}
                    THEN  1
		 WHEN Node.type in ('${NODE_TYPES.LINKEDIN_MESSAGE}','${
                  NODE_TYPES.LINKEDIN_PROFILE
                }','${NODE_TYPES.LINKEDIN_CONNECTION}','${
                  NODE_TYPES.LINKEDIN_INTERACT
                }') and Task.start_time + ${
                  lateSettings[NODE_TYPES.LINKEDIN_CONNECTION] || 0
                } < ${new Date().getTime()}
                    THEN  1
		 WHEN Node.type='${NODE_TYPES.DATA_CHECK}' and Task.start_time + ${
                  lateSettings[NODE_TYPES.DATA_CHECK] || 0
                } < ${new Date().getTime()}
                    THEN  1
		 WHEN Node.type='${NODE_TYPES.CADENCE_CUSTOM}' and Task.start_time + ${
                  lateSettings[NODE_TYPES.CADENCE_CUSTOM] || 0
                } < ${new Date().getTime()}
                    THEN  1
		ELSE 0
			END
                `
              ),
              'isLate',
            ],
          ],
        },
        {
          model: Cadence,
          attributes: ['name', 'cadence_id'],
          where: {
            status: CADENCE_STATUS.IN_PROGRESS,
          },
          include: [
            {
              model: Node,
              attributes: ['node_id'],
            },
          ],
        },
      ],
      //*
      //* => Ordering by daily task id so that every time it's fetched in same order
      order,
      //order: ['daily_task_id'],
      //logging: console.log,
    });

    //let tasks = await Task.findAll({
    //include: [
    //{
    //model: Daily_Tasks,
    //required: true,
    //},
    //],
    //});
    //console.log(JSON.stringify(tasks, null, 4));

    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    logger.error('Error while fetching tasks from daily tasks: ', err);
    return [null, err.message];
  }
};

//getTasksFromDailyTasks(
//'1',
//{ task: {}, account: {}, cadence: {}, node: {} },
//{
//cadence_custom: 86400000,
//call: 86400000,
//data_check: 86400000,
//linkedin_connection: 86400000,
//linkedin_interact: 86400000,
//linkedin_message: 86400000,
//linkedin_profile: 86400000,
//mail: 86400000,
//message: 86400000,
//}
//);

const getCustomTasksFromDailyTasks = async (
  user_id,
  filtersObject,
  order = []
) => {
  try {
    if (order?.length === 0)
      order = [
        [
          { model: Lead },
          { model: LeadToCadence },
          'lead_cadence_order',
          //'lead_id',
          'ASC',
        ],
        [{ model: Lead }, { model: LeadToCadence }, 'created_at', 'ASC'],
      ];
    const tasks = await Task.findAll({
      where: {
        user_id,
        ...filtersObject?.task,
        node_id: {
          [Op.in]: Object.values(CUSTOM_TASK_NODE_ID),
        },
      },
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
          model: Daily_Tasks,
          required: true,
          subQuery: false,
          attributes: ['user_id'],
        },
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
          ],
          include: [
            {
              model: Account,
              where: {
                ...filtersObject?.account,
              },
              required: true,
              subQuery: false,
              attributes: ['account_id', 'size', 'name'],
            },
            {
              model: Lead_phone_number,
              attributes: ['is_primary', 'time', 'timezone'],
            },
            {
              model: LeadToCadence,
              attributes: [],
            },
          ],
        },
        {
          model: Node,
          where: {
            type: {
              [Op.not]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
              ],
            },
            ...filtersObject?.node,
          },
          subQuery: false,
          attributes: [
            'node_id',
            'type',
            'step_number',
            'data',
            'next_node_id',
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
      //*
      //* => Ordering by daily task id so that every time it's fetched in same order
      order,
      //order: ['daily_task_id'],
      //logging: console.log,
    });

    //let tasks = await Task.findAll({
    //include: [
    //{
    //model: Daily_Tasks,
    //required: true,
    //},
    //],
    //});
    //console.log(JSON.stringify(tasks, null, 4));

    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    logger.error('Error while fetching custom tasks from daily tasks: ', err);
    return [null, err.message];
  }
};

const getCompletedTasksFromDailyTasks = async (
  user_id,
  filtersObject,
  order = [['complete_time', 'DESC']]
) => {
  try {
    const completedTasks = await Task.findAll({
      where: {
        ...filtersObject?.task,
        completed: 1, // will always fetch completed tasks
        user_id,
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
        'created_at',
      ],
      include: [
        {
          model: Daily_Tasks,
          required: true,
          subQuery: false,
          attributes: ['user_id'],
        },
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
          ],
          include: [
            {
              model: Account,
              where: {
                ...filtersObject?.account,
              },
              required: true,
              subQuery: false,
              attributes: ['account_id', 'size', 'name'],
            },
            {
              model: Lead_phone_number,
              attributes: ['is_primary', 'time', 'timezone'],
            },
          ],
        },
        {
          model: Node,
          where: {
            type: {
              [Op.not]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
              ],
            },
            ...filtersObject?.node,
          },
          //required: true,
          subQuery: false,
          attributes: [
            'node_id',
            'type',
            'step_number',
            'data',
            'next_node_id',
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
      order,
    });

    return [JsonHelper.parse(completedTasks), null];
  } catch (err) {
    logger.error(
      `Error while fetching completed tasks from daily tasks: ${err.message}.`
    );
    return [null, err.message];
  }
};

const TaskRepository = {
  createTask,
  getTask,
  getTasks,
  updateTask,
  updateTasks,
  deleteTasksByQuery,
  getPendingTasks,
  getLastTaskForLead,
  fetchTaskWithNoNode,
  getTasksByType,
  getCountForUserTasks,
  getLastTaskForUser,
  getCountForPendingTasks,
  getTasksInPriority,
  getTasksByNodeQuery,
  countTasks,
  getTasksByQuery,
  getTasksByCadenceAndNode,
  getTasksForLeaderboardGraph,
  getTasksWithLimitAndOffset,
  getCustomTaskForUser,
  getCompletedTaskByNode,
  getCompletedTaskCountByUserForCadence,
  getCompletedCustomTaskCountForCadence,
  getTasksNotInDailyTasks,
  getTasksWithNoNodeNotInDailyTasks,
  getAutomatedTasksForCron,
  getTasksByQueryInOrder,
  getTasksCountForPriorityAndType,
  getCompletedCustomTaskCountForUser,
  getCompletedCustomTaskCountForGroup,
  getCompletedCustomTaskCountForGroupByCadence,
  getCustomTaskForCadenceByGroup,
  getTasksFromDailyTasks,
  getCustomTasksFromDailyTasks,
  getCompletedTasksFromDailyTasks,
};

module.exports = TaskRepository;
