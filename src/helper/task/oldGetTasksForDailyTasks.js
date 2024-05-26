// Utils
const logger = require('../../utils/winston');
const {
  NODE_TYPES,
  CADENCE_PRIORITY,
  CUSTOM_TASK_NODE_ID,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const TaskRepository = require('../../repository/task.repository');
const UserRepository = require('../../repository/user-repository');

// Helpers and services
const UserHelper = require('../user');

const getTasksForDailyTasks = async (
  user_id,
  start_time = new Date().getTime()
) => {
  try {
    console.time(`COMPLETION TIME`);
    const [user, errForUser] = await UserRepository.findUserByQuery({
      user_id,
    });
    if (errForUser) return [null, errForUser];
    if (!user) return [null, `No user found.`];

    let tasks = []; // store all tasks to be returned

    let tasksWithNoNode = []; // store custom tasks
    let errForTasksWithNoNode = ''; // err for custom tasks
    let printConsoleLogs = false;

    // taskQuery
    let taskQuery = {
      user_id,
      completed: 0, // * not yet completed
      is_skipped: 0,
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

    // get todays completed tasks(non-automated)
    const completedTasksPromise =
      TaskRepository.getTasksCountForPriorityAndType(
        {
          // * task query
          completed: 1,
          user_id: user.user_id,
          complete_time: {
            [Op.between]: [todayStartTimeInMs, todayEndTimeInMs],
          },
        },
        {}, // * cadence query
        {
          // * node query
          type: {
            [Op.notIn]: [
              NODE_TYPES.AUTOMATED_MAIL,
              NODE_TYPES.AUTOMATED_MESSAGE,
            ],
          },
        }
      );

    // resolve all promises
    const [[completedTasks, errForCompletedTasks], [settings, errForSettings]] =
      await Promise.all([completedTasksPromise, settingsPromise]);

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

    console.log(taskSettings);

    let NODE_TYPES_KEYS = Object.keys(NODE_TYPES);
    let NODE_TYPES_VALUES = [];

    Object.values(NODE_TYPES).map((node_type) => {
      if (
        ![
          NODE_TYPES.AUTOMATED_MESSAGE,
          NODE_TYPES.AUTOMATED_MAIL,
          NODE_TYPES.END,
          NODE_TYPES.REPLY_TO,
        ].includes(node_type)
      )
        NODE_TYPES_VALUES.push(node_type);
    });

    let highPriorityCompletedTasks = {};
    let standardPriorityCompletedTasks = {};

    NODE_TYPES_VALUES.map((node_type) => {
      highPriorityCompletedTasks[node_type] = 0;
      standardPriorityCompletedTasks[node_type] = 0;
    });

    let nodeTypeToCompletedTaskVariableMap = {};

    NODE_TYPES_VALUES.map((node_type) => {
      nodeTypeToCompletedTaskVariableMap[node_type] = {
        [CADENCE_PRIORITY.HIGH]: (number) =>
          (highPriorityCompletedTasks[node_type] += number),
        [CADENCE_PRIORITY.STANDARD]: (number) =>
          (standardPriorityCompletedTasks[node_type] += number),
      };
    });

    completedTasks.map((completedTask) => {
      // If a 'reply to' completed task is found, then it should be counted as an completed mail task
      if (completedTask?.Node.type === NODE_TYPES.REPLY_TO)
        completedTask.Node.type = NODE_TYPES.MAIL;
      // if a function is found for type and priority, then call it to increment it's variable
      nodeTypeToCompletedTaskVariableMap[completedTask?.Node.type][
        completedTask?.Cadence?.priority
      ]?.(completedTask?.count || 0);
    });

    console.log(
      `HIGH PRIORITY COMPLETED TASKS: ` +
        JSON.stringify(highPriorityCompletedTasks, null, 4)
    );
    console.log(
      `STANDARD PRIORITY COMPLETED TASKS: ` +
        JSON.stringify(standardPriorityCompletedTasks, null, 4)
    );

    let highPriorityTasksPromise = [];
    let standardPriorityTasksPromise = [];

    NODE_TYPES_VALUES.map((node_type) => {
      let query = {};
      if (node_type === NODE_TYPES.MAIL)
        query = {
          type: {
            [Op.in]: [NODE_TYPES.MAIL, NODE_TYPES.REPLY_TO],
          },
        };
      else
        query = {
          type: node_type,
        };
      highPriorityTasksPromise.push(
        TaskRepository.getPendingTasks(
          taskQuery,
          query,
          CADENCE_PRIORITY.HIGH,
          []
        )
      );
      standardPriorityTasksPromise.push(
        TaskRepository.getPendingTasks(
          taskQuery,
          query,
          CADENCE_PRIORITY.STANDARD,
          []
        )
      );
    });

    let highPriorityTasks = {};
    let standardPriorityTasks = {};
    let errForHighPriorityTasks = {};
    let errForStandardPriorityTasks = {};

    NODE_TYPES_VALUES.map((node_type) => {
      highPriorityTasks[node_type] = [];
      standardPriorityTasks[node_type] = [];
      errForHighPriorityTasks[node_type] = '';
      errForStandardPriorityTasks[node_type] = '';
    });

    const resolvedPromises = await Promise.all(
      highPriorityTasksPromise.concat(standardPriorityTasksPromise)
    );
    let nodeTypesValuesLength = NODE_TYPES_VALUES.length;

    let highPriorityTasksResolvedPromise = resolvedPromises.slice(
      0,
      resolvedPromises.length / 2
    );
    let standardPriorityTasksResolvedPromise = resolvedPromises.slice(
      resolvedPromises.length / 2
    );

    //console.log(
    //`high priority tasks resolved promise: `,
    //highPriorityTasksResolvedPromise
    //);
    //console.log(
    //`standard priority tasks resolved promise: `,
    //standardPriorityTasksResolvedPromise
    //);

    highPriorityTasksResolvedPromise.map((resolvedPromise, index) => {
      if (resolvedPromise[1]) return [null, resolvedPromise[1]];
      highPriorityTasks[NODE_TYPES_VALUES[index]] = resolvedPromise[0];
    });

    standardPriorityTasksResolvedPromise.map((resolvedPromise, index) => {
      if (resolvedPromise[1]) return [null, resolvedPromise[1]];
      standardPriorityTasks[NODE_TYPES_VALUES[index]] = resolvedPromise[0];
    });

    if (printConsoleLogs) {
      NODE_TYPES_VALUES.map((node_type) => {
        console.log(
          `High Priority Tasks for ${node_type}: `,
          highPriorityTasks[node_type]?.length
        );
        console.log(
          `Standard Priority Tasks for ${node_type}:  `,
          standardPriorityTasks[node_type]?.length
        );
      });
    }

    let originalHighPriorityLimit = {};
    let originalStandardPriorityLimit = {};

    let highPriorityLimitLeft = {};
    let standardPriorityLimitLeft = {};

    let highPriorityLimitLeftBuffer = 0;
    let standardPriorityLimitLeftBuffer = 0;

    NODE_TYPES_VALUES.map((node_type) => {
      if (node_type === NODE_TYPES.CALL) {
        originalHighPriorityLimit[node_type] =
          taskSettings?.calls_per_day *
          (taskSettings?.high_priority_split / 100);
        originalStandardPriorityLimit[node_type] = Math.floor(
          taskSettings?.calls_per_day *
            ((100 - taskSettings?.high_priority_split) / 100)
        );
      } else if (node_type === NODE_TYPES.MAIL) {
        originalHighPriorityLimit[node_type] = Math.floor(
          taskSettings?.mails_per_day *
            (taskSettings?.high_priority_split / 100)
        );
        originalStandardPriorityLimit[node_type] = Math.floor(
          taskSettings?.mails_per_day *
            ((100 - taskSettings?.high_priority_split) / 100)
        );
      } else if (node_type === NODE_TYPES.MESSAGE) {
        originalHighPriorityLimit[node_type] = Math.floor(
          taskSettings?.messages_per_day *
            (taskSettings?.high_priority_split / 100)
        );
        originalStandardPriorityLimit[node_type] = Math.floor(
          taskSettings?.messages_per_day *
            ((100 - taskSettings?.high_priority_split) / 100)
        );
      } else if (node_type === NODE_TYPES.LINKEDIN_CONNECTION) {
        originalHighPriorityLimit[node_type] = Math.floor(
          taskSettings?.linkedin_connections_per_day *
            (taskSettings?.high_priority_split / 100)
        );
        originalStandardPriorityLimit[node_type] = Math.floor(
          taskSettings?.linkedin_connections_per_day *
            ((100 - taskSettings?.high_priority_split) / 100)
        );
      } else if (node_type === NODE_TYPES.LINKEDIN_MESSAGE) {
        originalHighPriorityLimit[node_type] = Math.floor(
          taskSettings?.linkedin_messages_per_day *
            (taskSettings?.high_priority_split / 100)
        );
        originalStandardPriorityLimit[node_type] = Math.floor(
          taskSettings?.linkedin_messages_per_day *
            ((100 - taskSettings?.high_priority_split) / 100)
        );
      } else if (node_type === NODE_TYPES.LINKEDIN_PROFILE) {
        originalHighPriorityLimit[node_type] = Math.floor(
          taskSettings?.linkedin_profiles_per_day *
            (taskSettings?.high_priority_split / 100)
        );
        originalStandardPriorityLimit[node_type] = Math.floor(
          taskSettings?.linkedin_profiles_per_day *
            ((100 - taskSettings?.high_priority_split) / 100)
        );
      } else if (node_type === NODE_TYPES.LINKEDIN_INTERACT) {
        originalHighPriorityLimit[node_type] = Math.floor(
          taskSettings?.linkedin_interacts_per_day *
            (taskSettings?.high_priority_split / 100)
        );
        originalStandardPriorityLimit[node_type] = Math.floor(
          taskSettings?.linkedin_profiles_per_day *
            ((100 - taskSettings?.high_priority_split) / 100)
        );
      } else if (node_type === NODE_TYPES.DATA_CHECK) {
        originalHighPriorityLimit[node_type] = Math.floor(
          taskSettings?.data_checks_per_day *
            (taskSettings?.high_priority_split / 100)
        );
        originalStandardPriorityLimit[node_type] = Math.floor(
          taskSettings?.data_checks_per_day *
            ((100 - taskSettings?.high_priority_split) / 100)
        );
      } else if (node_type === NODE_TYPES.CADENCE_CUSTOM) {
        originalHighPriorityLimit[node_type] = Math.floor(
          taskSettings?.cadence_customs_per_day *
            (taskSettings?.high_priority_split / 100)
        );
        originalStandardPriorityLimit[node_type] = Math.floor(
          taskSettings?.cadence_customs_per_day *
            ((100 - taskSettings?.high_priority_split) / 100)
        );
      } else if (node_type === NODE_TYPES.REPLY_TO) {
        originalHighPriorityLimit[node_type] = Math.floor(
          taskSettings?.reply_tos_per_day *
            (taskSettings?.high_priority_split / 100)
        );
        originalStandardPriorityLimit[node_type] = Math.floor(
          taskSettings?.reply_tos_per_day *
            ((100 - taskSettings?.high_priority_split) / 100)
        );
      }

      highPriorityLimitLeft[node_type] =
        originalHighPriorityLimit[node_type] -
        highPriorityCompletedTasks[node_type];

      standardPriorityLimitLeft[node_type] =
        originalStandardPriorityLimit[node_type] -
        standardPriorityCompletedTasks[node_type];
    });
    let j = 0;
    while (true) {
      if (j === 2) break;
      NODE_TYPES_VALUES.map((node_type) => {
        if (printConsoleLogs)
          console.log({
            node_type,
            highPriorityLimitLeftBuffer,
            highPriorityLimitLeft: highPriorityLimitLeft[node_type],
            standardPriorityLimitLeftBuffer,
            standardPriorityLimitLeft: standardPriorityLimitLeft[node_type],
          });
        if (highPriorityLimitLeft[node_type] < 0) {
          highPriorityLimitLeftBuffer += Math.abs(
            highPriorityLimitLeft[node_type]
          );
          highPriorityLimitLeft[node_type] = 0;
        }
        if (standardPriorityLimitLeft[node_type] < 0) {
          standardPriorityLimitLeftBuffer += Math.abs(
            standardPriorityLimitLeft[node_type]
          );
          standardPriorityLimitLeft[node_type] = 0;
        }
        if (highPriorityLimitLeftBuffer && highPriorityLimitLeft[node_type]) {
          if (highPriorityLimitLeft[node_type] > highPriorityLimitLeftBuffer)
            highPriorityLimitLeft[node_type] -= highPriorityLimitLeftBuffer;
          else if (
            highPriorityLimitLeft[node_type] < highPriorityLimitLeftBuffer
          ) {
            highPriorityLimitLeftBuffer -= highPriorityLimitLeft[node_type];
            highPriorityLimitLeft[node_type] = 0;
          } else {
            highPriorityLimitLeftBuffer = 0;
            highPriorityLimitLeft[node_type] = 0;
          }
        }
        if (
          standardPriorityLimitLeftBuffer &&
          standardPriorityLimitLeft[node_type]
        ) {
          if (
            standardPriorityLimitLeft[node_type] >
            standardPriorityLimitLeftBuffer
          )
            standardPriorityLimitLeft[node_type] -=
              standardPriorityLimitLeftBuffer;
          else if (
            standardPriorityLimitLeft[node_type] <
            standardPriorityLimitLeftBuffer
          ) {
            standardPriorityLimitLeftBuffer -=
              standardPriorityLimitLeft[node_type];
            standardPriorityLimitLeft[node_type] = 0;
          } else {
            standardPriorityLimitLeftBuffer = 0;
            standardPriorityLimitLeft[node_type] = 0;
          }
        }
      });
      j += 1;
    }

    if (printConsoleLogs) {
      console.log(`ORIGINAL HIGH PRIORITY LIMIT: `, originalHighPriorityLimit);
      console.log(
        `ORIGINAL STANDARD PRIORITY LIMIT: `,
        originalStandardPriorityLimit
      );

      console.log(`HIGH PRIORITY LIMIT LEFT: `, highPriorityLimitLeft);
      console.log(`STANDARD PRIORITY LIMIT LEFT: `, standardPriorityLimitLeft);
    }

    let highTasksBuffer = 0; // will store how many extra high priority tasks can be included for any type
    let standardTasksBuffer = 0; // will store how many extra standard priority tasks can be included for any type

    if (printConsoleLogs) {
      console.log('==========================================================');

      console.log(
        `High Tasks Buffer Before starting to fetch tasks: ${highTasksBuffer}`
      );
      console.log(
        `Standard Tasks Buffer Before starting to fetch tasks: ${standardTasksBuffer}\n\n`
      );
    }

    let slicedHighPriorityTasks = {};
    let slicedStandardPriorityTasks = {};

    // will fetch by the values defined in db
    NODE_TYPES_VALUES.map((node_type) => {
      slicedHighPriorityTasks[node_type] = highPriorityTasks[node_type].slice(
        0,
        highPriorityLimitLeft[node_type] + highTasksBuffer
      );
      // standard priority call tasks
      slicedStandardPriorityTasks[node_type] = standardPriorityTasks[
        node_type
      ].slice(0, standardPriorityLimitLeft[node_type] + standardTasksBuffer);

      // update buffers
      highTasksBuffer +=
        highPriorityLimitLeft[node_type] -
        slicedHighPriorityTasks[node_type]?.length;
      standardTasksBuffer +=
        standardPriorityLimitLeft[node_type] -
        slicedStandardPriorityTasks[node_type]?.length;

      if (printConsoleLogs) {
        console.log(
          `High Tasks Buffer After fetching ${node_type}: ${highTasksBuffer}`
        );
        console.log(
          `Standard Tasks Buffer After fetching ${node_type}: ${standardTasksBuffer}\n`
        );
      }
    });
    if (printConsoleLogs) {
      console.log(
        '==========================================================\n'
      );

      console.log('==========================================================');

      NODE_TYPES_VALUES.map((node_type) => {
        console.log(
          `Sliced highPriorityTasks for ${node_type}: `,
          slicedHighPriorityTasks[node_type]?.length
        );
        console.log(
          `Sliced standardPriorityTasks for ${node_type}: `,
          slicedStandardPriorityTasks[node_type]?.length,
          `\n`
        );
      });

      console.log('==========================================================');
    }

    // will adjust other tasks if limit is not satisfied
    let i = 0; // loop counter

    if (printConsoleLogs)
      console.log('==========================================================');

    while (true) {
      // go through all high priority types and fetch till highTasksBuffer becomes 0

      // check for any type only if extra tasks are available other than the tasks which are already fetched
      if (highTasksBuffer) {
        NODE_TYPES_VALUES.map((node_type) => {
          // if more high priority tasks are available other than already fetched
          if (
            highPriorityTasks[node_type]?.length >
            slicedHighPriorityTasks[node_type]?.length
          ) {
            const previousCount = slicedHighPriorityTasks[node_type]?.length;
            slicedHighPriorityTasks[node_type] = highPriorityTasks[
              node_type
            ].slice(
              0,
              previousCount + highTasksBuffer // not using limit, since it has already being applied, now only extra tasks equal to buffer can be fetched
            );

            if (printConsoleLogs) {
              console.log({ previousCount, highTasksBuffer });
              console.log({
                previousCount,
                [`slicedHighPriority${node_type}Tasks`]:
                  slicedHighPriorityTasks[node_type]?.length,
              });
            }
            // update buffer
            highTasksBuffer +=
              previousCount - slicedHighPriorityTasks[node_type]?.length;

            if (printConsoleLogs) {
              console.log(
                `High Tasks Buffer After fetching ${node_type}: ${highTasksBuffer}\n`
              );
            }
          }
        });
      }
      // finished fetching high tasks, so if high tasks buffer is not 0 then transfer it to standard tasks buffer and make high task buffer = 0
      standardTasksBuffer += highTasksBuffer;
      highTasksBuffer = 0;

      if (printConsoleLogs) {
        console.log(`\nRESETTING HIGH TASKS BUFFER`);
        console.log(`High Tasks Buffer: ${highTasksBuffer}`);
        console.log(`Standard Tasks Buffer: ${standardTasksBuffer}\n`);
      }

      if (standardTasksBuffer) {
        NODE_TYPES_VALUES.map((node_type) => {
          // if more standard priority tasks are available other than already fetched
          if (
            standardPriorityTasks[node_type]?.length >
            slicedStandardPriorityTasks[node_type]?.length
          ) {
            const previousCount =
              slicedStandardPriorityTasks[node_type]?.length;
            slicedStandardPriorityTasks[node_type] = standardPriorityTasks[
              node_type
            ].slice(
              0,
              previousCount + standardTasksBuffer // not using limit, since it has already being applied, now only extra tasks equal to buffer can be fetched
            );

            if (printConsoleLogs) {
              console.log({ previousCount, standardTasksBuffer });
              console.log({
                previousCount,
                [`slicedStandardPriority${node_type}Tasks`]:
                  slicedStandardPriorityTasks[node_type]?.length,
              });
            }

            // update buffer
            standardTasksBuffer +=
              previousCount - slicedStandardPriorityTasks[node_type]?.length;

            if (printConsoleLogs) {
              console.log(
                `STANDARD Tasks Buffer After fetching ${node_type}: ${standardTasksBuffer}`
              );
            }
          }
        });
      }

      // finished fetching standard tasks, so if standard tasks buffer is not 0 then transfer it to high tasks buffer and make standard task buffer = 0
      highTasksBuffer += standardTasksBuffer;
      standardTasksBuffer = 0;

      if (printConsoleLogs) {
        console.log(`\nRESETTING STANDARD TASKS BUFFER`);
        console.log(`High Tasks Buffer: ${highTasksBuffer}`);
        console.log(`Standard Tasks Buffer: ${standardTasksBuffer}\n`);
      }

      /*
       * loop will run exactly 2 times.
       *
       * In the first iteration, firstly high tasks will be fetched,if any high tasks buffer remain then it will be trasnfered to standard tasks buffer
       * and accordingly standard tasks will be fetched.
       *
       * But if standard tasks buffer remains then we need to transfer the buffer to high tasks and fetch the tasks again
       * Hence loop should run exactly 2 times.
       * */
      if (++i === 2) break;
    }
    if (printConsoleLogs) {
      console.log('==========================================================');

      console.log('==========================================================');
      console.log(`\nFinal High Tasks Buffer: ${highTasksBuffer}`);
      console.log(`Final Standard Tasks Buffer: ${standardTasksBuffer}\n`);
      console.log('==========================================================');
    }

    console.log('==========================================================');

    NODE_TYPES_VALUES.map((node_type) => {
      console.log(
        `HIGH PRIORITY ${node_type} tasks: ${slicedHighPriorityTasks[node_type]?.length}`
      );
      console.log(
        `STANDARD PRIORITY ${node_type} tasks: ${slicedStandardPriorityTasks[node_type]?.length}\n`
      );
    });

    console.log('==========================================================');

    // concating all high and standard priority tasks in a array
    let highPriorityTasksArray = [];
    let standardPriorityTasksArray = [];

    NODE_TYPES_VALUES.map((node_type) => {
      highPriorityTasksArray = highPriorityTasksArray.concat(
        slicedHighPriorityTasks[node_type]
      );
      standardPriorityTasksArray = standardPriorityTasksArray.concat(
        slicedStandardPriorityTasks[node_type]
      );
    });

    tasks = [];

    // sorting on high priority tasks based on lead_cadence_order(priority model)
    highPriorityTasksArray = highPriorityTasksArray.sort(
      (a, b) =>
        a?.Lead?.LeadToCadences?.[0]?.lead_cadence_order -
        b?.Lead?.LeadToCadences?.[0]?.lead_cadence_order
    );

    // sorting on standard priority tasks based on lead_cadence_order(priority model)
    standardPriorityTasksArray = standardPriorityTasksArray.sort(
      (a, b) =>
        a?.Lead?.LeadToCadences?.[0]?.lead_cadence_order -
        b?.Lead?.LeadToCadences?.[0]?.lead_cadence_order
    );

    // fetching custom tasks
    [tasksWithNoNode, errForTasksWithNoNode] =
      await TaskRepository.fetchTaskWithNoNode(
        {
          ...taskQuery,
          node_id: {
            [Op.in]: Object.values(CUSTOM_TASK_NODE_ID),
          },
        },
        []
      );

    if (errForTasksWithNoNode) return [null, errForTasksWithNoNode];

    // concating all high and standard priority tasks in a array
    tasks = []
      .concat(highPriorityTasksArray)
      .concat(standardPriorityTasksArray);

    console.log(
      `ASSIGNED TASKS LENGTH: ${tasks?.length},CUSTOM TASKS LENGTH: ${tasksWithNoNode?.length}`
    );

    // concating all tasks in a array in order of custom tasks,assigned tasks
    let result = [].concat(tasksWithNoNode).concat(tasks);

    console.log('RESULT: ', result.length);
    console.timeEnd(`COMPLETION TIME`);

    return [result, null];
  } catch (err) {
    logger.error(
      `Error while fetching tasks for daily tasks(refactored): `,
      err
    );
    return [null, err.message];
  }
};

//getTasksForDailyTasksRefactored('a3fe4ec3-fcf1-4544-8556-c98268e169cf');

module.exports = getTasksForDailyTasks;
