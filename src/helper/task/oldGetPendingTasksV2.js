// Utils
const logger = require('../../utils/winston');
const {
  TASKS_FILTERS_REQUEST_VALUES,
  TASKS_FILTERS_REQUEST_KEYS,
} = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Models
const { Task } = require('../../db/models');

// Repositories
const UserRepository = require('../../repository/user-repository');
const DailyTasksRepository = require('../../repository/daily-tasks.repository');

// Helpers and Services
const { getTaskFiltersV2 } = require('./getTaskFilters');

/**
 * * Order will be [urgent,custom,not completed,completed]
 */

const getPendingTasksV2 = async (filters, user_id, limit, offset) => {
  try {
    // stores result to return
    let result = [];

    // fetch user
    const [user, errForUser] = await UserRepository.findUserByQuery({
      user_id,
    });

    // If error occurs
    if (errForUser) return [null, `Error while fetching user: ${errForUser}.`];

    // If user not found
    if (!user) return [null, `No user found.`];

    // Get filters for db
    let [filtersForDb, errForFiltersForDb] = getTaskFiltersV2(
      filters,
      user.timezone
    );

    // If error occurs
    if (errForFiltersForDb) [null, errForFiltersForDb];
    //console.log(filtersForDb, user_id);

    /*
     * all these variables will determine which type of tasks should be fetched.
     * initially only due tasks will be fetched, completed tasks only if filter is applied.
     * change their values according to the filters, so that only required tasks are fetched
     * */
    let [
      fetchAssignedTasks,
      fetchCustomTasks,
      fetchAssignedCompletedTasks,
      fetchCustomCompletedTasks,
    ] = [true, true, false, false];
    // console.log(fetchAssignedTasks, fetchCustomTasks);

    /*
     * for all types of tasks, fetch them as individual promises and then all must be resolved together
     * */
    let promisesToResolve = [];
    let urgentTasksPromise = [];
    let notUrgentTasksPromise = [];
    let customTasksPromise = [];
    let assignedCompletedTasksPromise = [];
    let customCompletedTasksPromise = [];
    let completedTasksPromise = [];
    /*
     * filtersForDb has general filters which are needed for db query.
     * Each type of task may require some changes in original filterForDb,
     * so if needed than create a different filtersForDb for each type of task if required.
     *
     * */
    let filtersForDbForUrgentTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        // * urgent time is not 0 and less than or equal to current time
        [Op.and]: [
          {
            urgent_time: {
              [Op.ne]: 0,
            },
          },
          {
            urgent_time: {
              [Op.lte]: new Date().getTime(),
            },
          },
        ],
        completed: 0,
      },
    };

    let filtersForDbForNotUrgentTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        // * urgent time is greate than current time
        [Op.or]: [
          {
            urgent_time: {
              [Op.eq]: 0,
            },
          },
          {
            urgent_time: {
              [Op.gt]: new Date().getTime(),
            },
          },
        ],
        completed: 0,
      },
    };

    let filtersForDbForAssignedCompletedTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        completed: 1,
      },
    };

    let filtersForDbForCustomCompletedTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        completed: 1,
      },
    };

    // used only to fetch incomplete custom tasks
    let filtersForDbForCustomTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        completed: 0,
      },
    };
    // * different checks to decide which type of tasks to be fetched.

    // If there is filter for task action
    if (filters?.[TASKS_FILTERS_REQUEST_KEYS.TASK_ACTION]?.length) {
      /*
       * check if original filter has a filter for this task action,
       * if it has, then there will a value present for filtersForDb?.['node']?.['type'].
       * If true, then change this to task name, since custom tasks dont have node associated to them,
       * hence it will be applied to there name.
       * */
      if (filtersForDb?.['node']?.['type']) {
        filtersForDbForCustomTasks = {
          ...filtersForDb,
          task: {
            ...filtersForDb['task'],
            name: filtersForDb['node']['type'],
            completed: 0,
          },
        };
        filtersForDbForCustomCompletedTasks = {
          ...filtersForDb,
          task: {
            ...filtersForDb['task'],
            name: filtersForDb['node']['type'],
            completed: 1,
          },
        };
      }
    }

    let filtersForTaskType = filters?.[TASKS_FILTERS_REQUEST_KEYS.TASK_TYPE];
    let filtersForTaskCompletion =
      filters?.[TASKS_FILTERS_REQUEST_KEYS.TASK_COMPLETION];

    // If there is filter for task type
    if (filtersForTaskType?.length) {
      /*
       * check if it has one of the value as TASKS_FILTERS_REQUEST_VALUES.TASK_TYPE_ASSIGNED,
       * If yes, then we must not fetch custom tasks, so set it to false.
       * */
      if (
        filtersForTaskType?.includes(
          TASKS_FILTERS_REQUEST_VALUES.TASK_TYPE_ASSIGNED
        )
      ) {
        fetchCustomTasks = false;
        fetchCustomCompletedTasks = false;
      }
      /*
       * check if it has one of the value as TASKS_FILTERS_REQUEST_VALUES.TASK_TYPE_CUSTOM,
       * If yes, then we must not fetch assigned tasks, so set it to false.
       * */
      if (
        filtersForTaskType?.includes(
          TASKS_FILTERS_REQUEST_VALUES.TASK_TYPE_CUSTOM
        )
      ) {
        fetchAssignedTasks = false;
        fetchAssignedCompletedTasks = false;
      }
    }

    // If there is filter for task completetion
    if (filtersForTaskCompletion?.length) {
      /*
       * check if it has one of the value as TASKS_FILTERS_REQUEST_VALUES.TASK_COMPLETION_DUE,
       * If yes, then we must not fetch completed tasks, so set it to false.
       * */
      if (
        filtersForTaskCompletion?.includes(
          TASKS_FILTERS_REQUEST_VALUES.TASK_COMPLETION_DUE
        )
      ) {
        fetchAssignedCompletedTasks = false;
        fetchCustomCompletedTasks = false;
      } else if (
        /*
         * check if it has one of the value as TASKS_FILTERS_REQUEST_VALUES.TASK_COMPLETION_DONE,
         * If yes, then we must not fetch incomplete tasks, so set it to false.
         * */
        filtersForTaskCompletion?.includes(
          TASKS_FILTERS_REQUEST_VALUES.TASK_COMPLETION_DONE
        )
      ) {
        /*
         * before setting the incomplete tasks flag to false,
         * completed tasks should be fetched only that type of tasks, whose flag is true depending on other filters.
         * For e.g., If we were only supposed to fetch custom tasks, then here we would set its fetchCustomTasks as false,
         * but fetchCustomCompletedTasks woul still be true, and hence every time both assigned and custom completed tasks would be fetched.
         * */
        fetchAssignedCompletedTasks = fetchAssignedTasks;
        fetchCustomCompletedTasks = fetchCustomTasks;
        fetchAssignedTasks = false;
        fetchCustomTasks = false;
      }
    }

    // console.log(fetchAssignedTasks, fetchCustomTasks);

    // Now check for flag of each type of task and fetch them accordingly.

    // for assigned tasks(incomplete)
    if (fetchAssignedTasks) {
      /*
       * we split assigned tasks as urgent or notUrgent since that needs to be shown in different order in frontend.
       * see start of the function for order of tasks.
       * */
      urgentTasksPromise = DailyTasksRepository.getDailyTasksForUser(
        user_id,
        filtersForDbForUrgentTasks
      );

      notUrgentTasksPromise = DailyTasksRepository.getDailyTasksForUser(
        user_id,
        filtersForDbForNotUrgentTasks
      );
    }

    // for custom tasks(incomplete)
    if (fetchCustomTasks)
      customTasksPromise = DailyTasksRepository.getDailyTasksForUserWithNoNode(
        user_id,
        filtersForDbForCustomTasks
      );

    if (fetchAssignedCompletedTasks && fetchCustomCompletedTasks) {
      completedTasksPromise = await DailyTasksRepository.getCompletedDailyTasks(
        user_id,
        filtersForDbForAssignedCompletedTasks
      );
    } else {
      // for assigned tasks(completed)
      if (fetchAssignedCompletedTasks)
        // here we do not split on as urgent or not since they will be showed together in frontend.
        assignedCompletedTasksPromise =
          DailyTasksRepository.getDailyTasksForUser(
            user_id,
            filtersForDbForAssignedCompletedTasks,
            [[{ model: Task }, 'complete_time', 'DESC']] // most recent completed task first
          );

      if (fetchCustomCompletedTasks)
        customCompletedTasksPromise =
          DailyTasksRepository.getDailyTasksForUserWithNoNode(
            user_id,
            filtersForDbForCustomCompletedTasks,
            [[{ model: Task }, 'complete_time', 'DESC']] // most recent completed task first
          );
    }

    // * all promises to resolve
    promisesToResolve.push(
      urgentTasksPromise,
      customTasksPromise,
      notUrgentTasksPromise,
      assignedCompletedTasksPromise,
      customCompletedTasksPromise,
      completedTasksPromise
    );

    // resolve all promises
    let [
      urgentTasksPromiseValue,
      customTasksPromiseValue,
      notUrgentTasksPromiseValue,
      assignedCompletedTasksPromiseValue,
      customCompletedTasksPromiseValue,
      completedTasksPromiseValue,
    ] = await Promise.all(promisesToResolve);

    // check error for each promise value

    if (urgentTasksPromiseValue?.[1])
      return [
        null,
        `Error while fetching tasks: ${urgentTasksPromiseValue[1]}`,
      ];

    if (customTasksPromiseValue?.[1])
      return [
        null,
        `Error while fetching tasks: ${customTasksPromiseValue?.[1]}`,
      ];

    if (notUrgentTasksPromiseValue?.[1])
      return [
        null,
        `Error while fetching tasks: ${notUrgentTasksPromiseValue?.[1]}`,
      ];

    if (assignedCompletedTasksPromiseValue?.[1])
      return [
        null,
        `Error while fetching tasks: ${assignedCompletedTasksPromiseValue?.[1]}`,
      ];

    if (customCompletedTasksPromiseValue?.[1])
      return [
        null,
        `Error while fetching tasks: ${customCompletedTasksPromiseValue?.[1]}`,
      ];

    if (completedTasksPromiseValue?.[1])
      return [
        null,
        `Error while fetching tasks: ${completedTasksPromiseValue?.[1]}`,
      ];

    // for debugging
    logger.info(
      `URGENT ASSIGNED TASKS : ${urgentTasksPromiseValue?.[0]?.length}`
    );
    logger.info(`CUSTOM TASKS : ${customTasksPromiseValue?.[0]?.length}`);
    logger.info(
      `NOT URGENT ASSIGNED TASKS : ${notUrgentTasksPromiseValue?.[0]?.length}`
    );
    logger.info(
      `ASSIGNED COMPLETED TASKS : ${assignedCompletedTasksPromiseValue?.[0]?.length}`
    );
    logger.info(
      `CUSTOM COMPLETED TASKS : ${customCompletedTasksPromiseValue?.[0]?.length}`
    );
    logger.info(`COMPLETED TASKS : ${completedTasksPromiseValue?.[0]?.length}`);

    // add tasks to results only if they were fetched(if at all) without any error

    // tasks are appended in the order as they are required to be shown in frontend

    if (urgentTasksPromiseValue?.[0]?.length)
      result = urgentTasksPromiseValue?.[0];

    if (customTasksPromiseValue?.[0]?.length)
      result = result.concat(customTasksPromiseValue?.[0]);

    if (notUrgentTasksPromiseValue?.[0]?.length)
      result = result.concat(notUrgentTasksPromiseValue?.[0]);

    if (customCompletedTasksPromiseValue?.[0]?.length)
      result = result.concat(customCompletedTasksPromiseValue?.[0]);

    if (assignedCompletedTasksPromiseValue?.[0]?.length)
      result = result.concat(assignedCompletedTasksPromiseValue?.[0]);

    if (completedTasksPromiseValue?.[0]?.length)
      result = result.concat(completedTasksPromiseValue?.[0]);

    if (limit && offset)
      result = result.slice(parseInt(offset), parseInt(limit) + 1);
    else if (limit) result = result.slice(0, parseInt(limit));
    else if (offset) result = result.slice(parseInt(offset));

    logger.info(`RESULT: ${result?.length}.`);
    //result.map((r) => {
    //console.log(
    //`Task: ${r.Task.task_id}, Lead: ${r.Task.Lead.lead_id}, Lead cadence order: ${r.Task.Lead.LeadToCadences?.[0]?.lead_cadence_order}, Lead cadence link created_at: Lead cadence order: ${r.Task.Lead.LeadToCadences?.[0]?.created_at}}`
    //);
    //});
    return [result, null];
  } catch (err) {
    logger.error(`Error while fetching pending tasks v2: ${err.message}.`);
    return [null, err.message];
  }
};

module.exports = getPendingTasksV2;
