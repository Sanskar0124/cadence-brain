// Utils
const logger = require('../utils/winston');
const { USER_ROLE } = require('../utils/enums');

// Models
const { Op } = require('sequelize');
const { Department, User, Sub_Department } = require('../db/models');

const createDepartment = async (department) => {
  try {
    const createdDepartment = await Department.create(department);
    return [createdDepartment, null];
  } catch (err) {
    logger.error(`Error while creating department: ${err.message}`);
    return [null, err.message];
  }
};

const getAllDepartments = async (company_id) => {
  try {
    const departments = await Department.findAll({
      where: {
        company_id,
      },
    });
    return [JSON.parse(JSON.stringify(departments)), null];
  } catch (err) {
    logger.error(`Error while getting department: ${err.message}`);
    return [null, err.message];
  }
};

const getAllEmployees = async (user_id) => {
  try {
    const manager = await User.findOne({
      where: {
        user_id: user_id,
      },
      attributes: ['department_id'],
    });
    if (!manager.department_id) {
      logger.error('Department not found.');
      return [null, 'Department not found.'];
    }
    const employees = await User.findAll({
      where: {
        department_id: manager.department_id,
        role: {
          [Op.in]: [USER_ROLE.SALES_PERSON, USER_ROLE.SALES_MANAGER_PERSON],
        },
      },
    });
    return [JSON.parse(JSON.stringify(employees)), null];
  } catch (err) {
    logger.error(`Error while getting department employees: ${err.message}`);
    return [null, err.message];
  }
};

const getAllEmployeesWithoutAdmin = async (company_id) => {
  try {
    const users = await User.findAll({
      where: {
        company_id,
        role: {
          [Op.notIn]: [USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN],
        },
      },
      include: [
        {
          model: Sub_Department,
          attributes: [
            'name',
            'sd_id',
            'is_profile_picture_present',
            'profile_picture',
          ],
        },
      ],
      attributes: {
        include: [
          'user_id',
          'role',
          'first_name',
          'last_name',
          'sd_id',
          'profile_picture',
          'department_id',
          'timezone',
          'is_profile_picture_present',
        ],
      },
    });

    return [users, null];
  } catch (err) {
    logger.error(
      `Error while fetching employees without admin: ${err.message}.`
    );
    return [null, err.message];
  }
};

const DepartmentRepository = {
  createDepartment,
  getAllDepartments,
  getAllEmployees,
  getAllEmployeesWithoutAdmin,
};

module.exports = DepartmentRepository;
