// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  CUSTOM_TASK_NODE_ID,
  NODE_TYPES,
  CADENCE_LEAD_STATUS,
  LEAD_STATUS,
  CADENCE_STATUS,
  TASK_STATUSES,
} = require('../../utils/enums');

// Packages
const sequelize = require('sequelize');
const { Op } = require('sequelize');

// Db
const { Task, Lead, LeadToCadence } = require('../../db/models');

// Repositories
const Repository = require('../../repository');
const TaskRepository = require('../../repository/task.repository');

// Helpers and services
const UserHelper = require('../user');
const JsonHelper = require('../json');

const getPendingTasks = async ({ taskQuery, nodeQuery, filterArray, t }) => {
  try {
    if (!taskQuery) return [null, `Please provide taskQuery.`];

    //if (filterArray?.length === 0) filterArray = [['task_id', 'ASC']];
    if (filterArray?.length === 0)
      filterArray = [
        [
          { model: Lead },
          { model: LeadToCadence },
          'lead_cadence_order',
          //'lead_id',
          'ASC',
        ],
        [{ model: Lead }, { model: LeadToCadence }, 'created_at', 'ASC'],
      ];
    else filterArray = [filterArray];

    const [tasks, err] = await Repository.fetchAll({
      tableName: DB_TABLES.TASK,
      query: taskQuery,
      include: {
        [DB_TABLES.CADENCE]: {
          where: { status: CADENCE_STATUS.IN_PROGRESS },
          required: true,
          attributes: ['name', 'cadence_id'],
          [DB_TABLES.NODE]: {
            attributes: ['node_id'],
          },
        },
        [DB_TABLES.LEAD]: {
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING], // * Tasks for leads with status of 'new_lead' and 'ongoing'
            },
          },
          attributes: ['first_name', 'last_name', 'lead_id', 'job_position'],
          required: true,
          [DB_TABLES.ACCOUNT]: {
            attributes: ['account_id', 'size', 'name'],
          },
          [DB_TABLES.LEADTOCADENCE]: {
            where: {
              cadence_id: {
                [Op.eq]: sequelize.col('Task.cadence_id'),
              },
              status: CADENCE_LEAD_STATUS.IN_PROGRESS,
            },
            required: true,
            attributes: ['lead_cadence_order', 'created_at'],
          },
          [DB_TABLES.LEAD_PHONE_NUMBER]: {
            attributes: ['is_primary', 'time', 'timezone'],
          },
        },
        [DB_TABLES.NODE]: {
          where: nodeQuery,
          required: true,
          attributes: ['node_id', 'type', 'step_number'],
        },
      },
      extras: {
        order: filterArray,
        attributes: ['task_id', 'user_id', 'node_id', 'name', 'created_at'],
      },
      t,
    });
    if (err) return [null, err];

    // console.log(JSON.stringify(tasks, null, 4));
    return [JsonHelper.parse(tasks), null];
  } catch (err) {
    logger.error(`Error while fetching pending tasks: `, err);
    return [null, err.message];
  }
};

const getTasksForDailyTasks = async ({
  user_id,
  start_time = new Date().getTime(),
  t,
}) => {
  try {
    console.time(`COMPLETION TIME`);
    const [user, errForUser] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: {
        user_id,
      },
      t,
    });
    if (errForUser) return [null, errForUser];
    if (!user) return [null, `No user found.`];

    let tasks = []; // store all tasks to be returned
    let printConsoleLogs = true;

    // taskQuery
    let taskQuery = {
      user_id,
      status: TASK_STATUSES.INCOMPLETE,
      start_time: {
        [Op.lte]: start_time, // * time is less than or equal to start time provided
      },
      node_id: {
        [Op.notIn]: Object.values(CUSTOM_TASK_NODE_ID),
      },
    };

    let settingsPromise = UserHelper.getSettingsForUser({
      user_id,
      setting_type: DB_TABLES.TASK_SETTINGS,
      t,
    });

    // get current timestamp
    const currentStartTime = new Date().getTime();

    // get today's start time in ms according to user's timezone
    const todayStartTimeInMs = UserHelper.setHoursForTimezone(
      0,
      currentStartTime,
      user?.timezone
    );

    // get today's end time in ms according to user's timezone
    const todayEndTimeInMs = UserHelper.setHoursForTimezone(
      24,
      currentStartTime,
      user?.timezone
    );

    // TODO:TASK MIGRATION
    const completedTasksPromise = Repository.fetchAll({
      tableName: DB_TABLES.TASK,
      query: {
        // * task query
        completed: 1,
        user_id: user.user_id,
        complete_time: {
          [Op.between]: [todayStartTimeInMs, todayEndTimeInMs],
        },
      },
      include: {
        [DB_TABLES.NODE]: {
          where: {
            type: {
              [Op.notIn]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
              ],
            },
          },
          attributes: [],
        },
      },
      extras: {
        attributes: ['task_id'],
      },
      t,
    });

    // check if daily limit reached or not
    const dailyLimitPromise = UserHelper.checkIfDailyLimitReachedForEmail(
      user,
      null,
      null
    );

    // resolve all promises
    const [
      [completedTasks, errForCompletedTasks],
      [settings, errForSettings],
      [dailyLimitReached, errForDailyLimitReached],
    ] = await Promise.all([
      completedTasksPromise,
      settingsPromise,
      dailyLimitPromise,
    ]);

    // check for all errors

    if (errForCompletedTasks)
      return [
        null,
        `Error while calculating completed tasks: ${errForCompletedTasks}.`,
      ];

    if (errForSettings)
      return [null, `Error while fetching task settings: ${errForSettings}.`];

    let taskSettings = settings?.Task_Setting;

    if (!taskSettings) {
      logger.error(`Task Settings not found.`);
      return [null, `Task Settings not found.`];
    }

    //console.log(taskSettings);

    let isEmailLimitReached = false;

    if (
      errForDailyLimitReached ===
      `Automated mail count per day exceeded for user ${user?.first_name} ${user?.last_name}.`
    )
      isEmailLimitReached = true;

    let nodeTypesToIgnore = [
      NODE_TYPES.AUTOMATED_MAIL,
      NODE_TYPES.AUTOMATED_MESSAGE,
      NODE_TYPES.AUTOMATED_REPLY_TO,
    ];

    let nodeQuery = {};

    if (isEmailLimitReached)
      nodeTypesToIgnore = nodeTypesToIgnore.concat([
        NODE_TYPES.MAIL,
        NODE_TYPES.REPLY_TO,
      ]);

    nodeQuery = {
      type: {
        [Op.notIn]: nodeTypesToIgnore,
      },
    };

    if (printConsoleLogs) console.log({ nodeTypesToIgnore });

    let urgentTasksPromise = getPendingTasks({
      taskQuery,
      nodeQuery: { is_urgent: 1, ...nodeQuery }, // node query
      filterArray: [], // order
      t,
    });

    // TODO: think about where to sort for standard tasks and urgent tasks
    // since it will not be efficient if we sort in frontend route
    // think if we can do it here only
    // I think this can be handled in frontend route, since sort filter for urgent and standard tasks are straightforward

    // fetching custom tasks
    //let customTasksPromise = TaskRepository.fetchTaskWithNoNode(
    //{
    //...taskQuery,
    //node_id: {
    //[Op.in]: Object.values(CUSTOM_TASK_NODE_ID).concat([0]),
    //},
    //},
    //[]
    //);
    let customTasksPromise = Repository.fetchAll({
      tableName: DB_TABLES.TASK,
      query: {
        ...taskQuery,
        node_id: {
          [Op.in]: Object.values(CUSTOM_TASK_NODE_ID).concat([0]),
        },
      },
      include: {
        [DB_TABLES.LEAD]: {
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING], // * Tasks for leads with status of 'new_lead' and 'ongoing'
            },
          },
          [DB_TABLES.ACCOUNT]: {},
        },
      },
      t,
    });

    const [
      [urgentTasks, errForUrgentTasks],
      [tasksWithNoNode, errForTasksWithNoNode],
    ] = await Promise.all([urgentTasksPromise, customTasksPromise]);

    let standardTasks = [];
    let completedTasksLength = completedTasks?.length || 0;

    // if completed tasks are less than max tasks
    // and if urgent tasks are less than max tasks
    // then only fetch standard tasks

    if (printConsoleLogs) {
      console.log({
        urgentTasks: urgentTasks?.length,
        completedTasksLength,
      });
    }
    if (
      completedTasksLength < taskSettings?.max_tasks &&
      urgentTasks?.length < taskSettings?.max_tasks
    ) {
      // if completed tasks are less than max tasks
      // and urgent tasks are less than max tasks
      // in this case we need to fetch standard tasks
      if (printConsoleLogs) console.log(`Fetching standard tasks.. `);

      let [fetchedStandardTasks, errforStandardTasks] = await getPendingTasks({
        taskQuery,
        nodeQuery: { is_urgent: 0, ...nodeQuery }, // node query
        filterArray: [], // order
        t,
      });

      standardTasks = fetchedStandardTasks;
      // required tasks will be max_tasks - completed tasks
      let requiredTasksLength = taskSettings?.max_tasks - completedTasksLength;

      if (printConsoleLogs)
        console.log({
          standardTasks: fetchedStandardTasks?.length,
          requiredTasksLength,
        });
      // get all urgent tasks upto limit of requiredTasksLength
      tasks = Array.isArray(urgentTasks)
        ? urgentTasks?.slice(0, requiredTasksLength)
        : [];

      // if still limit not reached then take standard tasks
      if (tasks?.length !== requiredTasksLength) {
        if (printConsoleLogs) {
          console.log({
            requiredStandardTasksLength: requiredTasksLength - tasks?.length,
          });
          console.log(`Adding standard tasks...`);
        }
        tasks = tasks.concat(
          Array.isArray(standardTasks)
            ? standardTasks?.slice(0, requiredTasksLength - tasks?.length)
            : []
        );
      }
    } else if (completedTasksLength >= taskSettings?.max_tasks) {
      // if completed tasks are greater than or equal to max tasks
      // in this case only urgent tasks will be seen
      tasks = urgentTasks || [];
    } else if (
      completedTasksLength < taskSettings?.max_tasks &&
      urgentTasks?.length >= taskSettings?.max_tasks
    ) {
      // if completed tasks are less than max tasks
      // and urgent tasks are more than max tasks
      // in this case only urgent tasks will be seen

      // required tasks will be max_tasks - completed tasks
      let requiredTasksLength = taskSettings?.max_tasks - completedTasksLength;
      tasks = urgentTasks.slice(0, requiredTasksLength);
    }
    // check for max tasks
    // if completed tasks >  max tasks, then only show urgent tasks which are avaialble

    // concating all high and standard priority tasks in a array
    //tasks = []
    //.concat(highPriorityTasksArray)
    //.concat(standardPriorityTasksArray);

    console.log(
      `ASSIGNED TASKS LENGTH: ${tasks?.length},CUSTOM TASKS LENGTH: ${tasksWithNoNode?.length}`
    );

    // concating all tasks in a array in order of custom tasks,assigned tasks
    let result = []
      .concat(Array.isArray(tasksWithNoNode) ? tasksWithNoNode : [])
      .concat(tasks);

    console.log('RESULT: ', result.length);
    console.timeEnd(`COMPLETION TIME`);

    return [result, null];
  } catch (err) {
    console.log(err);
    logger.error(
      `Error while fetching tasks for daily tasks(refactored): `,
      err
    );
    return [null, err.message];
  }
};

module.exports = getTasksForDailyTasks;
