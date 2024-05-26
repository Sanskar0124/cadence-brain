// Utils
const logger = require('../utils/winston');
const { NODE_TYPES } = require('../utils/enums');

// Models
const { Op } = require('sequelize');
const {
  User,
  Lead,
  Account,
  Activity,
  sequelize,
  LeadToCadence,
  Task,
  Node,
  Company,
  Company_Tokens,
  Company_Settings,
  User_Token,
  Sub_Department,
} = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const createUser = async (user) => {
  try {
    const createdUser = await User.create(user);
    return [createdUser, null];
  } catch (err) {
    if (err.errors[0].message) {
      let msg = err.errors[0].message;
      logger.error(msg);
      return [null, msg];
    }
    logger.error(`Error while creating user: ${err.message}`);
    return [null, err.message];
  }
};

const findUserByQuery = async (query) => {
  try {
    const user = await User.findOne({
      where: query,
    });

    return [JSON.parse(JSON.stringify(user)), null];
  } catch (err) {
    logger.error(`Error while finding user by query: ${err.message}.`);
    return [null, err.message];
  }
};

const findUserByQueryWithCompany = async (query) => {
  try {
    const user = await User.findOne({
      where: query,
      include: [
        {
          model: Company,
          include: [
            {
              model: Company_Settings,
            },
          ],
        },
      ],
    });

    return [JSON.parse(JSON.stringify(user)), null];
  } catch (err) {
    logger.error(`Error while finding user by query: ${err.message}.`);
    return [null, err.message];
  }
};

const findUsersByQuery = async (query) => {
  try {
    const users = await User.findAll({
      where: query,
    });

    return [JSON.parse(JSON.stringify(users)), null];
  } catch (err) {
    logger.error(`Error while finding users by query: ${err.message}.`);
    return [null, err.message];
  }
};

const updateUserById = async (user, user_id) => {
  try {
    const updatedUser = await User.update(user, {
      where: {
        user_id,
      },
    });
    return [updatedUser, null];
  } catch (err) {
    logger.error(`Error while updating user by id: ${err.message}.`);
    return [null, err.message];
  }
};

const updateUserByEmail = async (user, email) => {
  try {
    const updatedUser = await User.update(user, {
      where: {
        email,
      },
    });
    return [updatedUser, null];
  } catch (err) {
    logger.error(`Error while updating user by email: ${err.message}.`);
    return [null, err];
  }
};

const updateAllUsers = async (user) => {
  try {
    const updatedUsers = await User.update(user, {
      where: {
        [Op.not]: [
          {
            first_name: '',
          },
        ],
      },
    });
    return [updatedUsers, null];
  } catch (err) {
    logger.error(`Error while updating all users: ${err.message}.`);
    return [null, err];
  }
};

const deleteUserById = async (user_id) => {
  try {
    const deletedUser = await User.destroy({
      where: {
        user_id,
      },
    });
    return [deletedUser, null];
  } catch (err) {
    logger.error(`Error while deleting user by id: ${err.message}.`);
    return [null, err];
  }
};

const getAllSubDepartmentUsersWithLeads = async (
  query,
  timeRangeForLead,
  type = 'monitoring'
) => {
  try {
    const leadQuery = [];

    // if (type === 'monitoring') {
    //   // * filter by first_contact_time, but if it is null filter by created_at
    //   leadQuery.push(
    //     {
    //       first_contact_time: sequelize.where(
    //         sequelize.literal('unix_timestamp(first_contact_time)*1000'),
    //         {
    //           [Op.between]: timeRangeForLead,
    //         }
    //       ),
    //     },
    //     {
    //       created_at: sequelize.where(
    //         sequelize.literal('unix_timestamp(Leads.created_at)*1000'),
    //         {
    //           [Op.between]: timeRangeForLead,
    //         }
    //       ),
    //     }
    //   );
    // }

    if (type === 'metrics') {
      // * fetch by created_at only
      leadQuery.push({
        created_at: sequelize.where(
          sequelize.literal('unix_timestamp(Leads.created_at)*1000'),
          {
            [Op.between]: timeRangeForLead,
          }
        ),
      });
    }

    const users = await User.findAll({
      where: query,
      include: [
        {
          model: Lead,
          where: {
            [Op.or]: leadQuery,
          },
          required: false,
          include: [
            {
              model: Account,
            },
            {
              model: Activity,
            },
          ],
        },
      ],
      order: [['first_name', 'ASC']], // * ascending order for user's first name
      // logging: console.log
    });
    return [JSON.parse(JSON.stringify(users)), null];
  } catch (err) {
    logger.error(
      `Error while fetching all sub department users with leads: ${err.message}`
    );
    return [null, err.message];
  }
};

const getUsersByCadence = async (query) => {
  try {
    const users = await User.findAll({
      // where: query,
      include: [
        {
          model: Account,
          where: {
            [Op.not]: {
              salesforce_account_id: null,
            },
          },
          required: true,
          include: [
            {
              model: Lead,
              required: true,
              include: [
                {
                  model: LeadToCadence,
                  where: {
                    cadence_id: query.cadence_id,
                  },
                  attributes: { exclude: ['created_at , updated_at'] },
                  required: true,
                },
              ],
              attributes: ['lead_id', 'first_name', 'last_name'],
            },
          ],
        },
      ],
      attributes: { exclude: ['created_at , updated_at'] },
    });
    return [users, null];
  } catch (err) {
    logger.error(`Error while fetching users by query: ${err.message}`);
    return [null, err.message];
  }
};

const getAllSubDepartmentUsersWithTaskCount = async (
  sd_id,
  timezone_starttime
) => {
  try {
    const users = await User.findAll({
      where: {
        sd_id,
      },
      attributes: [
        'user_id',
        'first_name',
        'last_name',
        'is_profile_picture_present',
        'profile_picture',
      ],
      include: [
        {
          model: Task,
          where: {
            completed: 1,
            complete_time: {
              [Op.gte]: timezone_starttime,
            },
          },
          include: {
            model: Node,
            where: {
              type: {
                [Op.notIn]: [
                  NODE_TYPES.AUTOMATED_MAIL,
                  NODE_TYPES.AUTOMATED_MESSAGE,
                ],
              },
            },
            required: true,
          },
          //attributes: [[sequelize.literal(`COUNT(*)`), 'count']],
          attributes: ['task_id'],
          required: false,
        },
      ],
      order: [
        ['first_name', 'ASC'],
        ['last_name', 'ASC'],
      ],
    });
    return [JSON.parse(JSON.stringify(users)), null];
  } catch (err) {
    logger.error(`Error while fetching users by query: ${err.message}`);
    return [null, err.message];
  }
};

const getUserWithCompanyTokens = async (query) => {
  try {
    const user = await User.findOne({
      where: query,
      include: [
        {
          model: Company,
          include: [
            {
              model: Company_Tokens,
            },
            {
              model: Company_Settings,
              attributes: ['lusha_kaspr_action', 'salesforce_pn_field'],
            },
          ],
        },
        { model: User_Token },
      ],
    });

    return [JsonHelper.parse(user), null];
  } catch (err) {
    logger.error(
      `Error while fetching user with company tokens: ${err.message}`
    );
    return [null, err.message];
  }
};

const updateUsers = async (query, user) => {
  try {
    const users = await User.update(user, {
      where: query,
    });
    return [users, null];
  } catch (err) {
    logger.error(`Error while updating users: ${err.message}`);
    return [null, err.message];
  }
};

const getAllUsersWithSubDepartment = async (
  userQuery,
  sdQuery,
  userAttributes = [],
  sdAttributes
) => {
  try {
    let attributesQuery = {};

    if (userAttributes?.length)
      attributesQuery.User = {
        attributes: userAttributes,
      };

    if (sdAttributes?.length)
      attributesQuery.Sub_Department = {
        attributes: sdAttributes,
      };

    const users = await User.findAll({
      where: userQuery,
      ...attributesQuery.User,
      include: [
        {
          model: Sub_Department,
          where: sdQuery,
          ...attributesQuery.Sub_Department,
        },
      ],
    });

    return [JsonHelper.parse(users), null];
  } catch (err) {
    logger.error(`Error while fetching users with sub-department: `, err);
    return [null, err.message];
  }
};

const UserRepository = {
  createUser,
  updateUserById,
  updateUserByEmail,
  updateAllUsers,
  deleteUserById,
  getUsersByCadence,
  getAllSubDepartmentUsersWithLeads,
  findUserByQuery,
  findUsersByQuery,
  getAllSubDepartmentUsersWithTaskCount,
  findUserByQueryWithCompany,
  getUserWithCompanyTokens,
  updateUsers,
  getAllUsersWithSubDepartment,
};

module.exports = UserRepository;
