// Utils
const logger = require('../../utils/winston');
const {
  TASKS_FILTERS_REQUEST_VALUES,
  TASKS_FILTERS_REQUEST_KEYS,
  LEAD_WARMTH,
  TASK_STATUSES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Models
const { Task, Lead } = require('../../db/models');

// Repositories
const UserRepository = require('../../repository/user-repository');
const DailyTasksRepository = require('../../repository/daily-tasks.repository');

// Helpers and Services
const { getTaskFiltersV2 } = require('./getTaskFilters');
const UserHelper = require('../user');

/**
 * * Order will be [urgent,custom,not completed,completed]
 */

const getPendingTasksV2 = async (filters, user_id, limit, offset) => {
  try {
    // stores result to return
    let result = [];

    limit = parseInt(limit);
    offset = parseInt(offset);

    // fetch user
    const [user, errForUser] = await UserRepository.findUserByQuery({
      user_id,
    });
    if (errForUser) return [null, `Error while fetching user: ${errForUser}.`];
    if (!user) return [null, `No user found.`];

    let [settings, errForSettings] = await UserHelper.getSettingsForUser({
      user_id,
      setting_type: DB_TABLES.TASK_SETTINGS,
    });
    let taskSettings = settings?.Task_Setting || {};

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
      fetchOnlyUrgentTasks,
      fetchAssignedScheduledTasks,
    ] = [true, true, false, false, false, false];
    // console.log(fetchAssignedTasks, fetchCustomTasks);

    /*
     * for all types of tasks, fetch them as individual promises and then all must be resolved together
     * */
    let promisesToResolve = [];
    let urgentTasksPromise = [];
    let hotLeadTasksPromise = [];
    let notUrgentTasksPromise = [];
    let customTasksPromise = [];
    let assignedCompletedTasksPromise = [];
    let customCompletedTasksPromise = [];
    let completedTasksPromise = [];
    let scheduledTasksPromise = [];

    /*
     * filtersForDb has general filters which are needed for db query.
     * Each type of task may require some changes in original filterForDb,
     * so if needed than create a different filtersForDb for each type of task if required.
     *
     * late tag:
     * here we have a filter for late tag but we don't have to do any checks for that filter as it does not take part in ordering so it can be by default applied in every query
     *
     * hot lead:
     * here we have a filter for hot lead and we have to make checks for this filter as it does take part in ordering
     * hot leads are needed to be shown on top(irrespective of other tags), so for this we have to fetch hot leads in seperate query
     * for this all filters except for hot lead should by default have check for lead_warmth to be cold and hot leads will be fetched in seperate query
     * if filter for hot lead is applied than seperate query for hot lead is not required, instead in every filter we can have check for lead_warmth to be hot. since all leads will be then hot ordering will not be an issue
     * */
    let filtersForDbForUrgentTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        status: TASK_STATUSES.INCOMPLETE,
      },
      node: {
        ...filtersForDb['node'],
        is_urgent: 1,
      },
      lead: {
        ...filtersForDb['lead'],
        lead_warmth: LEAD_WARMTH.COLD,
      },
    };

    let filtersForDbForHotLeadTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        status: TASK_STATUSES.INCOMPLETE,
      },
      lead: {
        ...filtersForDb['lead'],
        lead_warmth: LEAD_WARMTH.HOT,
      },
      node: {
        ...filtersForDb['node'],
        //is_urgent: 0, no check for urgent so that hot leads will contain irrespective of whether a task is urgent or not
      },
    };

    let filtersForDbForNotUrgentTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        status: TASK_STATUSES.INCOMPLETE,
      },
      node: {
        ...filtersForDb['node'],
        is_urgent: 0,
      },
      lead: {
        ...filtersForDb['lead'],
        lead_warmth: LEAD_WARMTH.COLD,
      },
    };

    let filtersForDbForAssignedCompletedTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        completed: 1, // TODO:TASK MIGRATION
      },
    };

    let filtersForDbForCustomCompletedTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        completed: 1, // TODO:TASK MIGRATION
      },
    };

    let filtersForDbForAssignedScheduledTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        status: TASK_STATUSES.SCHEDULED,
      },
    };

    // used only to fetch incomplete custom tasks
    let filtersForDbForCustomTasks = {
      ...filtersForDb,
      task: {
        ...filtersForDb['task'],
        status: TASK_STATUSES.INCOMPLETE,
      },
    };
    // * different checks to decide which type of tasks to be fetched.

    let filtersForTaskType = filters?.[TASKS_FILTERS_REQUEST_KEYS.TASK_TYPE];
    let filtersForTaskCompletion =
      filters?.[TASKS_FILTERS_REQUEST_KEYS.TASK_COMPLETION];
    let filtersForTaskTag = filters?.[TASKS_FILTERS_REQUEST_KEYS.TASK_TAG];
    let filtersForLeadTag = filters?.[TASKS_FILTERS_REQUEST_KEYS.LEAD_TAG];

    // will indicate whether there is a filter present for TASKS_FILTERS_REQUEST_VALUES.LEAD_TAG_HOT
    let isFilterForLeadTagHotPresent = false;

    // If there is filter for task action
    if (filtersForLeadTag?.length) {
      /*
       * if lead tag is hot, then remove the warmth condition from all filters
       * */
      if (
        filtersForLeadTag?.includes(TASKS_FILTERS_REQUEST_VALUES.LEAD_TAG_HOT)
      ) {
        filtersForDbForUrgentTasks = {
          ...filtersForDbForUrgentTasks,
          lead: {
            ...filtersForDbForUrgentTasks?.lead,
            lead_warmth: LEAD_WARMTH.HOT,
          },
        };
        filtersForDbForNotUrgentTasks = {
          ...filtersForDbForNotUrgentTasks,
          lead: {
            ...filtersForDbForNotUrgentTasks?.lead,
            lead_warmth: LEAD_WARMTH.HOT,
          },
        };
        filtersForDbForAssignedCompletedTasks = {
          ...filtersForDbForAssignedCompletedTasks,
          lead: {
            ...filtersForDbForAssignedCompletedTasks?.lead,
            lead_warmth: LEAD_WARMTH.HOT,
          },
        };
        filtersForDbForCustomCompletedTasks = {
          ...filtersForDbForCustomCompletedTasks,
          lead: {
            ...filtersForDbForCustomCompletedTasks?.lead,
            lead_warmth: LEAD_WARMTH.HOT,
          },
        };
        isFilterForLeadTagHotPresent = true;
      }
    }

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

    // if there is filter for task tag
    if (filtersForTaskTag?.length) {
      /*
       * check if it has one of the value as TASKS_FILTERS_REQUEST_VALUES.TASK_TAG_URGENT,
       * If yes, then we must only fetch urgent tasks, so set it to true.
       * */
      if (
        filtersForTaskTag?.includes(
          TASKS_FILTERS_REQUEST_VALUES.TASK_TAG_URGENT
        )
      )
        fetchOnlyUrgentTasks = true;
      /*
       * check if it has one of the value as TASKS_FILTERS_REQUEST_VALUES.TASK_TAG_LATE,
       * If yes, then we must only fetch assigned tasks and no custom tasks as these do not have late tag, so set it to false.
       * */
      if (
        filtersForTaskTag?.includes(TASKS_FILTERS_REQUEST_VALUES.TASK_TAG_LATE)
      )
        fetchCustomTasks = false;
    }

    // if there is filter for lead tag
    if (filtersForLeadTag?.length) {
      /*
       * check if it has one of the value as TASKS_FILTERS_REQUEST_VALUES.LEAD_TAG_HOT,
       * If yes, then we must only fetch assigned tasks and no custom tasks as these do not have hot tag, so set it to false.
       * */
      if (
        filtersForLeadTag?.includes(TASKS_FILTERS_REQUEST_VALUES.LEAD_TAG_HOT)
      )
        fetchCustomTasks = false;
    }

    // If there is filter for task completion
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
         * but fetchCustomCompletedTasks would still be true, and hence every time both assigned and custom completed tasks would be fetched.
         * */
        fetchAssignedCompletedTasks = fetchAssignedTasks;
        fetchCustomCompletedTasks = fetchCustomTasks;
        fetchAssignedTasks = false;
        fetchCustomTasks = false;
      } else if (
        /*
         * check if it has one of the value as TASKS_FILTERS_REQUEST_VALUES.TASK_COMPLETION_DONE,
         * If yes, then we must not fetch incomplete tasks, so set it to false.
         * */
        filtersForTaskCompletion?.includes(
          TASKS_FILTERS_REQUEST_VALUES.TASK_COMPLETION_SCHEDULED
        )
      ) {
        fetchAssignedScheduledTasks = fetchAssignedTasks;
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
       * hot lead tasks need to show up along with urgent tasks
       * */
      urgentTasksPromise = DailyTasksRepository.getDailyTasksForUser(
        user_id,
        filtersForDbForUrgentTasks,
        taskSettings?.late_settings || {},
        [
          [
            { model: Task },
            'start_time',
            //'lead_id',
            'ASC',
          ],
        ]
      );

      // if fetchOnlyUrgentTasks is true then set filtersForDbForHotLeadTasks to fetch only hot leads with urgent task
      if (fetchOnlyUrgentTasks)
        filtersForDbForHotLeadTasks = {
          ...filtersForDbForHotLeadTasks,
          node: {
            ...filtersForDbForHotLeadTasks['node'],
            is_urgent: 1, // to fetch hot leads with urgent tasks only
          },
        };

      if (!isFilterForLeadTagHotPresent)
        hotLeadTasksPromise = DailyTasksRepository.getDailyTasksForUser(
          user_id,
          filtersForDbForHotLeadTasks,
          [
            [
              { model: Task },
              'start_time',
              //'lead_id',
              'ASC',
            ],
          ]
        );

      if (!fetchOnlyUrgentTasks) {
        notUrgentTasksPromise = DailyTasksRepository.getDailyTasksForUser(
          user_id,
          filtersForDbForNotUrgentTasks,
          taskSettings?.late_settings || {}
        );
      }
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
            taskSettings?.late_settings || {},
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

    if (fetchAssignedScheduledTasks)
      scheduledTasksPromise = DailyTasksRepository.getScheduledDailyTasks(
        user_id,
        filtersForDbForAssignedScheduledTasks
      );

    // * all promises to resolve
    promisesToResolve.push(
      urgentTasksPromise,
      hotLeadTasksPromise,
      customTasksPromise,
      notUrgentTasksPromise,
      assignedCompletedTasksPromise,
      customCompletedTasksPromise,
      completedTasksPromise,
      scheduledTasksPromise
    );

    // resolve all promises
    let [
      urgentTasksPromiseValue,
      hotLeadTasksPromiseValue,
      customTasksPromiseValue,
      notUrgentTasksPromiseValue,
      assignedCompletedTasksPromiseValue,
      customCompletedTasksPromiseValue,
      completedTasksPromiseValue,
      scheduledTasksPromiseValue,
    ] = await Promise.all(promisesToResolve);

    // check error for each promise value

    if (urgentTasksPromiseValue?.[1])
      return [
        null,
        `Error while fetching tasks: ${urgentTasksPromiseValue[1]}`,
      ];

    if (hotLeadTasksPromiseValue?.[1])
      return [
        null,
        `Error while fetching tasks: ${hotLeadTasksPromiseValue[1]}`,
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

    if (scheduledTasksPromiseValue?.[1])
      return [
        null,
        `Error while fetching tasks: ${scheduledTasksPromiseValue?.[1]}`,
      ];

    // for debugging
    // logger.info(
    //   `URGENT ASSIGNED TASKS : ${urgentTasksPromiseValue?.[0]?.length}`
    // );
    // logger.info(
    //   `HOT LEAD ASSIGNED TASKS : ${hotLeadTasksPromiseValue?.[0]?.length}`
    // );
    // logger.info(`CUSTOM TASKS : ${customTasksPromiseValue?.[0]?.length}`);
    // logger.info(
    //   `NOT URGENT ASSIGNED TASKS : ${notUrgentTasksPromiseValue?.[0]?.length}`
    // );
    // logger.info(
    //   `ASSIGNED COMPLETED TASKS : ${assignedCompletedTasksPromiseValue?.[0]?.length}`
    // );
    // logger.info(
    //   `CUSTOM COMPLETED TASKS : ${customCompletedTasksPromiseValue?.[0]?.length}`
    // );
    // logger.info(`COMPLETED TASKS : ${completedTasksPromiseValue?.[0]?.length}`);

    // add tasks to results only if they were fetched(if at all) without any error

    // tasks are appended in the order as they are required to be shown in frontend

    if (hotLeadTasksPromiseValue?.[0]?.length)
      result = hotLeadTasksPromiseValue?.[0];

    if (urgentTasksPromiseValue?.[0]?.length)
      result = result.concat(urgentTasksPromiseValue?.[0]);

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

    if (scheduledTasksPromiseValue?.[0]?.length)
      result = result.concat(scheduledTasksPromiseValue?.[0]);

    if (limit && offset)
      result = result.slice(parseInt(offset), parseInt(offset + limit));
    else if (limit) result = result.slice(0, parseInt(limit));
    else if (offset) result = result.slice(parseInt(offset));

    // logger.info(`RESULT: ${result?.length}.`);
    //result.map((r) => {
    //console.log(
    //`Task: ${r.Task.task_id}, Lead: ${r.Task.Lead.lead_id}, Lead cadence order: ${r.Task.Lead.LeadToCadences?.[0]?.lead_cadence_order}, Lead cadence link created_at: Lead cadence order: ${r.Task.Lead.LeadToCadences?.[0]?.created_at}}`
    //);
    //});

    return [result, null];
  } catch (err) {
    logger.error(`Error while fetching pending tasks v2: `, err);
    return [null, err.message];
  }
};

module.exports = getPendingTasksV2;
