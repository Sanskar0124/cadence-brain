// Utils
const logger = require('../utils/winston');
const { LEAD_STATUS, USER_ROLE } = require('../utils/enums');

// Models
const { Op } = require('sequelize');
const {
  Sub_Department,
  User,
  Lead,
  Account,
  Calendar_Settings,
  Conversation,
  Activity,
  User_Task,
  Sub_Department_Settings,
  Department,
  User_Token,
} = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const createSubDepartment = async (subDepartment) => {
  try {
    const createdSubDepartment = await Sub_Department.create(subDepartment);
    return [createdSubDepartment, null];
  } catch (err) {
    logger.error(`Error while creating sub department: ${err.message}`);
    return [null, err.message];
  }
};

const getSubDepartment = async (query) => {
  try {
    const subDepartment = await Sub_Department.findOne({
      where: query,
      include: Sub_Department_Settings,
    });
    return [subDepartment, null];
  } catch (err) {
    logger.error(`Error while fetching sub department: ${err.message}`);
    return [null, err.message];
  }
};

const updateSubDepartment = async (sd_id, subDepartment) => {
  try {
    const updatedSubDepartment = await Sub_Department.update(subDepartment, {
      where: {
        sd_id,
      },
    });
    return [updatedSubDepartment, null];
  } catch (err) {
    logger.error(`Error while updating sub department: ${err.message}`);
    return [null, err.message];
  }
};

const getAllSubDepartments = async (query) => {
  try {
    const subDepartments = await Sub_Department.findAll({
      where: query,
    });
    return [JSON.parse(JSON.stringify(subDepartments)), null];
  } catch (err) {
    logger.error(
      `Error while fetching sub departments by query: ${err.message}`
    );
    return [null, err.message];
  }
};

const getAllSubDepartmentsWithSalesPersonCount = async (query) => {
  try {
    const subDepartments = await Sub_Department.findAll({
      where: query,
      include: {
        model: User,
        attributes: ['user_id'],
      },
      // logging: console.log,
    });
    return [subDepartments, null];
  } catch (err) {
    logger.error(
      `Error while fetching sub departments with user: ${err.message}`
    );
    return [null, err.message];
  }
};

const getAllSubDepartmentsSalesPersonForDashboard = async (
  query,
  leadQuery = {}
) => {
  try {
    const sdSalesPersons = await Sub_Department.findAll({
      where: query,
      include: {
        model: User,
        where: {
          role: {
            [Op.in]: [USER_ROLE.SALES_PERSON, USER_ROLE.SALES_MANAGER_PERSON], // only for salesPersons
          },
        },
        required: false,
        include: {
          model: Lead,
          where: leadQuery,
          required: false,
          // include: [
          //   {
          //     model: Account,
          //     attributes: {
          //       exclude: ['created_at', 'updated_at'],
          //     },
          //   },
          //   {
          //     model: Conversation,
          //   },
          // ],
          attributes: {
            exclude: ['created_at', 'updated_at'],
          },
        },
        attributes: {
          exclude: ['created_at', 'updated_at'],
        },
      },
      attributes: [
        'sd_id',
        'name',
        'profile_picture',
        'is_profile_picture_present',
      ],
      order: [['name', 'ASC']],
    });

    return [JsonHelper.parse(sdSalesPersons), null];
  } catch (err) {
    logger.error(
      `Error while in getSubDepartmentSalesPersonForDashboard: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getManagerDashboardData = async (user_id) => {
  // user_id will be the manager id.
  console.log(user_id);
  try {
    logger.info('Fetching data for sd manager....');
    // getting sd_id from manager
    const manager = await User.findOne({
      where: {
        user_id: user_id,
      },
      attributes: ['sd_id'],
    });
    if (!manager.sd_id) {
      logger.error('Sub department not found.');
      return [null, 'Sub department not found.'];
    }
    logger.info('Manager found.');
    // getting leads for a salesPerson
    const sdSalesPersons = await Sub_Department.findOne({
      where: {
        sd_id: manager.sd_id,
      },
      include: {
        model: User,
        where: {
          role: {
            [Op.in]: [USER_ROLE.SALES_PERSON, USER_ROLE.SALES_MANAGER_PERSON], // only for salesPersons
          },
        },
        include: {
          model: Lead,
          include: [
            {
              model: Account,
              attributes: {
                exclude: ['created_at', 'updated_at'],
              },
            },
            {
              model: Conversation,
            },
          ],
          attributes: {
            exclude: ['created_at', 'updated_at'],
          },
        },
        attributes: {
          exclude: ['created_at', 'updated_at'],
        },
      },
      attributes: [],
    });
    if (!sdSalesPersons) {
      console.log('No Salespersons present.');
      return [null, 'No Salespersons present.'];
    }
    logger.info('SalesPersons found.');
    // console.log(JSON.stringify(sdSalesPersons, null, 2));
    let result = {};
    for (let salesPerson of sdSalesPersons.Users) {
      const leadsResult = {};
      for (let status in LEAD_STATUS) {
        const leadCountRow = salesPerson.Leads.filter(
          (l) => l.status === LEAD_STATUS[status]
        );
        if (!leadCountRow) {
          leadsResult[LEAD_STATUS[status]] = 0;
        } else {
          leadsResult[LEAD_STATUS[status]] = leadCountRow.length;
        }
      }
      let no_of_messages = 0;
      let no_of_emails = 0;
      salesPerson.Leads.map((l) => {
        no_of_messages += l.Conversations.length;
      });

      // ======== ADDING ACTIVITY DATA - CALL AND MESSAGE TO LEAD ========
      for (let l of salesPerson.dataValues.Leads) {
        // GETIING ACTIVITY FOR LEAD

        /* call activity */
        const callActivity = await Activity.findAll({
          where: {
            lead_id: l.lead_id,
            type: 'call',
          },
        });

        /* message activity */
        const messageActivity = await Activity.findAll({
          where: {
            lead_id: l.lead_id,
            type: 'message',
          },
        });

        /* mail activity */
        const mailActivity = await Activity.findAll({
          where: {
            lead_id: l.lead_id,
            type: 'mail',
          },
        });

        no_of_emails = no_of_emails + mailActivity.length; // calculating all email activity of the salesperson

        // Setting call activity and message activity
        l.dataValues.callActivity = callActivity.length;
        l.dataValues.messageActivity = messageActivity.length;
        l.dataValues.mailActivity = mailActivity.length;
      }

      // ======== USING ACTIVITIES TO FETCH THE TIME_LIMIT_TILL_FIRST_CALL ========

      // Fetch the timezone of the salesperson and working days and working hours

      /* Get salesperson calendar settings */
      let calendarSettings = await Calendar_Settings.findOne({
        where: {
          user_id: salesPerson.dataValues.user_id,
        },
      });

      let {
        working_days,
        working_start_hour,
        working_end_hour,
        break_start_time,
        break_end_time,
      } = calendarSettings.dataValues;

      let totalMinutes = 0;
      for (let l of salesPerson.Leads) {
        // FETCH THE LEAD ACTIVITY AND EXTRACT THE FIRST CALL ACTIVITY
        try {
          const activities = await Activity.findAll({
            where: {
              lead_id: l.lead_id,
              type: 'call',
            },
            attributes: ['created_at'],
            order: [['created_at', 'ASC']],
          });

          Date.prototype.addHours = function (h) {
            this.setHours(this.getUTCHours() + h);
            return this;
          };

          function addDays(theDate, days) {
            return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
          }
          let activityTime = new Date(activities[0].get().created_at);
          let assignedTime = new Date(l.assigned_time);

          /* LOGIC TO HANDLE WORKING DAYS WORKING HOURS AND BREAK TIME */

          /*
        - If the lead is assigned on a non working day, modify assigning time to the next working day's working time.
      - If the lead is assigned earlier than the working time on a working day, modify time to working time start.
      - If the lead is assigned on a working day, but after working hours, modify assign time to next working day's working time.

      */

          /*
          Date object returns Sun as 0, while we store Monday as 0.
      Hence, 
      0 (from date object) = 6 in db
        1 (from date object) = 0 in db
      2 (from date object) = 1 in db
      3 (from date object) = 2 in db
      4 (from date object) = 3 in db
      5 (from date object) = 4 in db
      6 (from date object) = 5 in db

    */

          try {
            let calculatedAssignedDay =
              assignedTime.getDay() - 1 < 0 ? 6 : assignedTime.getDay() - 1;

            // Check if the assignedDay is a working day
            if (working_days[calculatedAssignedDay]) {
              //   logger.info('Assigned on a working day');
              // Check if it has been assigned within the working hours
              // Checking if before working hours
              if (
                parseInt(assignedTime.getUTCHours()) <
                parseInt(working_start_hour.split(':')[0])
              ) {
                // logger.info(
                //   'The lead was assigned on a working day, but too early. Modifying the time.'
                // );
                // Setting time to working time
                assignedTime.setUTCHours(
                  parseInt(working_start_hour.split(':')[0]),
                  0,
                  0
                );
              }
              // Checking if after working hours
              else if (
                parseInt(assignedTime.getUTCHours()) >
                parseInt(working_end_hour.split(':')[0])
              ) {
                // logger.info(
                //   'The lead was assigned on a working day, but too late. Modifying the time to next available working.'
                // );

                let foundDay = false;
                let potentialFoundDay = calculatedAssignedDay;
                let addedDays = 1;
                while (!foundDay) {
                  potentialFoundDay = potentialFoundDay + 1;
                  if (potentialFoundDay > 6) {
                    // Since uper limit is 6
                    potentialFoundDay = 0;
                  }
                  if (working_days[potentialFoundDay]) {
                    foundDay = true;
                  } else {
                    addedDays = addedDays + 1;
                  }
                }

                assignedTime = addDays(assignedTime, addedDays); // Adding days
                assignedTime.setUTCHours(
                  parseInt(working_start_hour.split(':')[0]),
                  0,
                  0
                );
              }
              // Checking if during break time
              else if (
                parseInt(break_start_time.split(':')[0]) <=
                  assignedTime.getUTCHours() &&
                parseInt(break_end_time.split(':')[0]) >=
                  assignedTime.getUTCHours()
              ) {
                logger.info('Lead assigned during break time...');
                assignedTime.setUTCHours(
                  parseInt(break_end_time.split(':')[0]),
                  parseInt(break_end_time.split(':')[1]),
                  0
                );
              }
            } else {
              /* Lead assigned not on a working day! */
              logger.info('Finding the next working day...');
              let foundDay = false;
              let potentialFoundDay = calculatedAssignedDay;
              let addedDays = 1;
              while (!foundDay) {
                potentialFoundDay = potentialFoundDay + 1;
                if (potentialFoundDay > 6) {
                  // Since uper limit is 6
                  potentialFoundDay = 0;
                }
                if (working_days[potentialFoundDay]) {
                  foundDay = true;
                } else {
                  addedDays = addedDays + 1;
                }
              }
              assignedTime = addDays(assignedTime, addedDays); // Adding days
              assignedTime.setUTCHours(
                parseInt(working_start_hour.split(':')[0]),
                0,
                0
              ); // Setting to working start time.
            }
          } catch (e) {
            logger.error(e.message);
          }

          logger.info(
            'Difference in minutes: ' +
              Math.floor(Math.abs((activityTime - assignedTime) / 1000) / 60)
          );

          // Updating total time difference
          totalMinutes =
            Math.floor(Math.abs((activityTime - assignedTime) / 1000) / 60) +
            totalMinutes;
        } catch (e) {
          logger.error('No interaction with lead');
        }
      }

      // Calculate Average
      let time_limit_till_first_call = 0;
      try {
        time_limit_till_first_call =
          Math.round((totalMinutes / salesPerson.Leads.length) * 100) / 100;
      } catch (e) {
        logger.error('No leads assigned');
      }

      result[salesPerson.user_id] = {
        ...salesPerson.dataValues,
        statistics: {
          monitoring: leadsResult,
          metrics: {
            number_of_calls: 0,
            number_of_mails: no_of_emails,
            number_of_messages: no_of_messages,
            '%_of_leads_converted': 0,
            time_limit_till_first_call: time_limit_till_first_call,
          },
        },
      };
    }

    logger.info('Count fetched.');
    logger.info('Data for sd manager fetched.');
    // logger.info('Result :- ');
    // logger.info(JSON.stringify(result, null, 2));
    return [result, null];
  } catch (err) {
    // console.log(err);
    logger.error(err.message);
    return [null, err];
  }
};

const getAllEmployees = async (user_id) => {
  try {
    const manager = await User.findOne({
      where: {
        user_id: user_id,
      },
      attributes: ['sd_id'],
    });
    if (!manager.sd_id) {
      logger.error('Sub department not found.');
      return [null, 'Sub department not found.'];
    }
    const employees = await User.findAll({
      where: {
        sd_id: manager.sd_id,
        role: {
          [Op.or]: [USER_ROLE.SALES_PERSON, USER_ROLE.SALES_MANAGER_PERSON],
        },
      },
    });
    return [JSON.parse(JSON.stringify(employees)), null];
  } catch (err) {
    logger.error(
      `Error while getting sub department employees: ${err.message}`
    );
    return [null, err.message];
  }
};

const getEmployees = async (sd_id) => {
  try {
    const employees = await User.findAll({
      where: {
        sd_id: sd_id,
        role: {
          [Op.ne]: [USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN],
        },
      },
      include: [
        {
          model: User_Task,
        },
        {
          model: User_Token,
          attributes: [
            'encrypted_ringover_api_key',
            'ringover_api_key',
            'user_id',
          ],
        },
      ],
    });
    return [JSON.parse(JSON.stringify(employees)), null];
  } catch (err) {
    logger.error(
      `Error while getting sub department employees: ${err.message}`
    );
    return [null, err.message];
  }
};

const getAllSubdepartmentsByCompanyId = async (company_id) => {
  try {
    const subdepartments = await Sub_Department.findAll({
      include: {
        model: Department,
        where: {
          company_id: company_id,
        },
        required: true,
      },
    });
    return [JSON.parse(JSON.stringify(subdepartments)), null];
  } catch (err) {
    logger.error(
      `Error while getting sub departments by company_id: ${err.message}`
    );
    return [null, err.message];
  }
};

const getSubDepartmentByQueryWithAttributes = async (
  query,
  sdAttributes = []
) => {
  try {
    let sdAttributesObject = {};

    if (sdAttributes?.length !== 0)
      sdAttributesObject = {
        attributes: sdAttributes,
      };
    const subDepartments = await Sub_Department.findAll({
      where: query,
      ...sdAttributesObject,
    });

    return [JsonHelper.parse(subDepartments), null];
  } catch (err) {
    logger.error(
      `Error while fetching sub-department by query with attributes: ${err.message}.`
    );
    return [null, err.message];
  }
};

const deleteSubDepartment = async (sd_id) => {
  try {
    const subdepartment = await Sub_Department.destroy({
      where: {
        sd_id,
      },
    });
    return [subdepartment, null];
  } catch (err) {
    logger.error(
      `Error while deleting sub departments by sd_id: ${err.message}`
    );
    return [null, err.message];
  }
};

const getAllSubDepartmentsWithSettings = async (query) => {
  try {
    const subDepartments = await Sub_Department.findAll({
      where: query,
      include: [Sub_Department_Settings],
    });
    return [JsonHelper.parse(subDepartments), null];
  } catch (err) {
    logger.error(
      `Error while fetching sub departments with settings: ${err.message}`
    );
    return [null, err.message];
  }
};

const SubDepartmentRepository = {
  createSubDepartment,
  getSubDepartment,
  updateSubDepartment,
  getAllSubDepartments,
  getAllSubDepartmentsWithSalesPersonCount,
  getManagerDashboardData,
  getAllEmployees,
  getEmployees,
  getAllSubDepartmentsSalesPersonForDashboard,
  getAllSubdepartmentsByCompanyId,
  getSubDepartmentByQueryWithAttributes,
  deleteSubDepartment,
  getAllSubDepartmentsWithSettings,
};

module.exports = SubDepartmentRepository;
