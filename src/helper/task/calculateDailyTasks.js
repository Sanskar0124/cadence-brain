// Utils
const logger = require('../../utils/winston');
const {
  SETTING_TYPES,
  TASK_NAMES_BY_TYPE,
  NODE_TYPES,
  TASK_STATUSES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Db
const { sequelize } = require('../../db/models');

// Repositories
const DailyTasksRepository = require('../../repository/daily-tasks.repository');
const UserRepository = require('../../repository/user-repository');
const TaskRepository = require('../../repository/task.repository');
const Repository = require('../../repository');

// * Helpers and Services
const getTasksForDailyTasks = require('./getTasksForDailyTasks');
const UserHelper = require('../user');
const SocketHelper = require('../socket');

const calculateDailyTasks = async (data) => {
  let t = await sequelize.transaction();
  try {
    data = JSON.parse(data);

    const { user_id, start_time } = data;

    logger.info(`Calculating daily tasks for user: ${user_id}...`);

    //const [user, errForUser] = await UserRepository.findUserByQuery({
    //user_id,
    //});
    const [user, errForUser] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: { user_id },
      t,
    });
    if (errForUser) {
      t.rollback();
      return [null, errForUser];
    }
    if (!user) {
      t.rollback();
      logger.error(`User not found for user_id: ${user_id}.`);
      return [null, `User not found for user_id: ${user_id}.`];
    }

    // get assigned,custom tasks
    let [tasks, errForTasks] = await getTasksForDailyTasks({
      user_id,
      start_time: start_time || new Date().getTime(),
      t,
    });
    if (errForTasks) {
      t.rollback();
      return [null, errForTasks];
    }

    const timeFilterForToday = [
      UserHelper.setHoursForTimezone(0, new Date().getTime(), user.timezone),
      UserHelper.setHoursForTimezone(24, new Date().getTime(), user.timezone),
    ];

    // fetch completed tasks for today
    let promiseArray = [];

    promiseArray.push(
      Repository.fetchAll({
        tableName: DB_TABLES.TASK,
        query: {
          user_id,
          completed: 1,
          complete_time: {
            [Op.between]: timeFilterForToday,
          },
        },
        extras: {
          order: [['complete_time', 'DESC']],
        },
        t,
      })
    );
    //promiseArray.push(
    //TaskRepository.getTasksByQueryInOrder(
    //{
    //user_id,
    //completed: 1,
    //complete_time: {
    //[Op.between]: timeFilterForToday,
    //},
    //},
    //[['complete_time', 'DESC']]
    //)
    //);
    promiseArray.push(
      Repository.fetchAll({
        tableName: DB_TABLES.TASK,
        query: {
          user_id,
          status: TASK_STATUSES.SCHEDULED,
          start_time: {
            [Op.between]: timeFilterForToday,
          },
        },
        extras: {
          attributes: ['task_id', 'node_id', 'user_id'],
        },
        t,
      })
    );

    let values = await Promise.all(promiseArray);

    let [completedTasks, errForCompletedTasks] = values[0];
    let [scheduledTasks, errFetchingScheduledTask] = values[1];
    if (errForCompletedTasks) {
      t.rollback();
      return [null, errForCompletedTasks];
    }
    if (errFetchingScheduledTask) {
      t.rollback();
      return [null, errFetchingScheduledTask];
    }

    if (!completedTasks) completedTasks = [];
    if (!scheduledTasks) scheduledTasks = [];

    logger.info(
      `Found ${completedTasks?.length} completed tasks,${tasks?.length} assigned tasks for user ${user_id}.`
    );
    logger.info(
      `Found ${scheduledTasks?.length} scheduled tasks,${tasks?.length} assigned tasks for user ${user_id}.`
    );
    tasks = tasks.concat(completedTasks);
    tasks = tasks.concat(scheduledTasks);

    // update shown time for this tasks
    let taskIds = [];
    let dailyTasks = [];

    let taskCache = {};

    tasks?.map((task) => {
      // if taskIds does not already include task_id, then push into taskIds
      if (!taskIds.includes(task.task_id)) {
        taskCache[task.task_id] = task;
        taskIds.push(task.task_id);
        dailyTasks.push({
          task_id: task.task_id,
          user_id: task.user_id,
          node_id: task.node_id,
        });
        // else print log stating duplicate found for debugging
      } else {
        console.log(`Duplicate entry for task ${task.task_id} in recalculate`);
        console.log(
          `Value in cache for task ${task.task_id}: ` +
            JSON.stringify(taskCache[task.task_id], null, 4)
        );
        console.log(
          `Current value for task ${task.task_id}: ` +
            JSON.stringify(task, null, 4)
        );
      }
    });

    // * delete existing daily tasks for user
    //const [deleted, errForDeleted] =
    //await DailyTasksRepository.deleteDailyTasksByQuery({ user_id });
    const [deleted, errForDeleted] = await Repository.destroy({
      tableName: DB_TABLES.DAILY_TASKS,
      query: { user_id },
      t,
    });
    if (errForDeleted) {
      t.rollback();
      return [null, errForDeleted];
    }

    logger.info(`Deleted: ${deleted}.`);

    const [taskSettings, errForTaskSettings] =
      await UserHelper.getSettingsForUser({
        user_id,
        setting_type: SETTING_TYPES.TASK_SETTINGS,
        t,
      });
    if (!taskSettings.Task_Setting)
      logger.error(`No task settings found for user: ${user_id}.`);

    const currentTime = new Date().getTime();
    const late_settings = taskSettings?.Task_Setting?.late_settings || {};

    // update shown time for tasks
    const shownTimeUpdatePromise = Repository.update({
      tableName: DB_TABLES.TASK,
      query: {
        task_id: {
          [Op.in]: taskIds,
        },
        shown_time: null,
      },
      updateObject: {
        shown_time: currentTime,
        late_time: sequelize.literal(`CASE
					name
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.CALL]}'
						then ${currentTime} + ${late_settings?.[NODE_TYPES.CALL] || 0}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.MAIL]}'
						then ${currentTime} + ${late_settings?.[NODE_TYPES.MAIL] || 0}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.REPLY_TO]}'
						then ${currentTime} + ${late_settings[NODE_TYPES.MAIL] || 0}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.MESSAGE]}'
						then ${currentTime} + ${late_settings?.[NODE_TYPES.MESSAGE] || 0}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.DATA_CHECK]}'
						then ${currentTime} + ${late_settings?.[NODE_TYPES.DATA_CHECK] || 0}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.CADENCE_CUSTOM]}'
						then ${currentTime} + ${late_settings?.[NODE_TYPES.CADENCE_CUSTOM] || 0}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_CONNECTION]}'
						then ${currentTime} + ${late_settings?.[NODE_TYPES.LINKEDIN_CONNECTION] || 0}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_MESSAGE]}'
						then ${currentTime} + ${late_settings?.[NODE_TYPES.LINKEDIN_MESSAGE] || 0}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_PROFILE]}'
						then ${currentTime} + ${late_settings?.[NODE_TYPES.LINKEDIN_PROFILE] || 0}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_INTERACT]}'
						then ${currentTime} + ${late_settings?.[NODE_TYPES.LINKEDIN_INTERACT] || 0}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.WHATSAPP]}'
						then ${currentTime} + ${late_settings?.[NODE_TYPES.WHATSAPP] || 0}
						else ${currentTime}
					END
	`),
      },
      t,
    });

    // * add to daily tasks table
    //const createdDailyTasksPromise =
    //DailyTasksRepository.createDailyTasks(dailyTasks);
    const createdDailyTasksPromise = Repository.bulkCreate({
      tableName: DB_TABLES.DAILY_TASKS,
      createObject: dailyTasks,
      t,
    });
    //const [createdDailyTasks, errForDailyTasks] =
    //await DailyTasksRepository.createDailyTasks(dailyTasks);

    const [
      [shownTimeUpdate, errForShownTimeUpdate],
      [createdDailyTasks, errForDailyTasks],
    ] = await Promise.all([shownTimeUpdatePromise, createdDailyTasksPromise]);

    if (errForDailyTasks) {
      console.log(`Tried to create daily tasks: ${dailyTasks?.length}`);
      const [dailyTasksAfterTryingDelete, errForDailyTasksAfterTryingDelete] =
        await Repository.fetchAll({
          tableName: DB_TABLES.DAILY_TASKS,
          query: { user_id },
          t,
        });
      if (dailyTasksAfterTryingDelete?.length === 0)
        console.log(
          `No tasks found for dailyTasksAfterTryingDelete: ` +
            JSON.stringify(dailyTasksAfterTryingDelete, null, 4)
        );

      //console.log(
      //`Daily tasks fetched after delete failed: ` +
      //JSON.stringify(dailyTasksAfterTryingDelete, null, 4)
      //);
      console.log(
        `${dailyTasksAfterTryingDelete?.length} Daily tasks fetched after delete failed`
      );
      t.rollback();

      return [null, errForDailyTasks];
    }

    logger.info(`Calculated daily tasks for user: ${user_id}.`);
    logger.info(`Shown time updated for ${shownTimeUpdate} tasks.`);

    t.commit();

    // sent recalculate event to frontend
    SocketHelper.sendRecalculateEvent({ user_id });

    return [`Calculated daily tasks.`, null];
  } catch (err) {
    t.rollback();
    logger.error(
      `Error while calculating and storing tasks in redis: ${err?.message}.`
    );
    return [null, err.message];
  }
};

module.exports = calculateDailyTasks;
