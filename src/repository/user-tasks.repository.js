// Utils
const logger = require('../utils/winston');

// Models
const { User_Task, User } = require('../db/models');

const createUserTask = async (userTask) => {
  try {
    const createdUserTask = await User_Task.create(userTask);
    logger.info(
      'Created User Task: ' + JSON.stringify(createdUserTask, null, 4)
    );
    return [createdUserTask, null];
  } catch (err) {
    logger.error(`Error while creating user task: ${err.message}.`);
    return [null, err.message];
  }
};

const updateUserTask = async (query, userTask) => {
  try {
    const data = await User_Task.update(userTask, {
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while updating user task: ${err.message}.`);
    return [null, err.message];
  }
};

const getUserTask = async (query) => {
  try {
    const userTask = await User_Task.findOne({
      where: query,
      raw: true,
    });

    return [userTask, null];
  } catch (err) {
    logger.error(`Error while fetching user task: ${err.message}.`);
    return [null, err.message];
  }
};

const getUserTasks = async (query) => {
  try {
    const userTasks = await User_Task.findAll({
      where: query,
      include: {
        model: User,
      },
    });

    return [JSON.parse(JSON.stringify(userTasks)), null];
  } catch (err) {
    logger.error(`Error while fetching user task: ${err.message}.`);
    return [null, err.message];
  }
};

const deleteUserTaskByQuery = async (query) => {
  try {
    const data = await User_Task.destroy({
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting user task by query: ${err.message}.`);
    return [null, err.message];
  }
};

const UserTaskRepository = {
  createUserTask,
  updateUserTask,
  getUserTask,
  getUserTasks,
  deleteUserTaskByQuery,
};

module.exports = UserTaskRepository;
