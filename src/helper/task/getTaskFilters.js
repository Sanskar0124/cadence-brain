// Utils
const logger = require('../../utils/winston');
const {
  TASK_FILTERS,
  SORT_TYPES,
  TASKS_FILTERS_REQUEST_KEYS,
  TASKS_FILTERS_REQUEST_VALUES,
  NODE_TYPES,
  ACCOUNT_SIZE,
  LEAD_WARMTH,
  TASK_STATUSES,
} = require('../../utils/enums');

// Packages
const { Lead, Account, Node, List, Cadence, Tag } = require('../../db/models');
const { Op } = require('sequelize');

// Helpers and Services
const UserHelper = require('../user');

const getTaskFilters = (filter, sort_type) => {
  try {
    // * Check if valid filter present
    if (!Object.values(TASK_FILTERS).includes(filter) && filter)
      return [null, `Invalid filter: ${filter}.`];

    // * Check if valid sort_type filters
    if (!Object.values(SORT_TYPES).includes(sort_type) && sort_type)
      return [null, `Invalid type: ${sort_type}.`];

    // * result for different filters
    switch (filter) {
      case TASK_FILTERS.FIRST_IN_LAST_OUT:
        return [['start_time', sort_type], null];
      case TASK_FILTERS.GROUP_BY_COMPANY:
        return [[{ model: Lead }, { model: Account }, 'name', sort_type], null];
      case TASK_FILTERS.INTERACTIONS_ONLY:
        return [[{ model: Node }, 'type', sort_type], null];
      case TASK_FILTERS.SORT_BY_SIZE:
        return [[{ model: Lead }, { model: Account }, 'size', sort_type], null];
      case TASK_FILTERS.SORT_BY_TAG:
        return [
          [
            { model: List },
            { model: Cadence },
            { model: Tag },
            'tag_name',
            sort_type,
          ],
          null,
        ];
      case TASK_FILTERS.SORT_BY_STEP:
        return [[{ model: Node }, 'step_number', sort_type], null];
      default:
        return [[], null];
    }
  } catch (err) {
    logger.error(`Error while fetching task filters`, err);
    return [null, err.message];
  }
};

/**
 * * Key will have a valid filter value for task
 * * Value will be an object which will be equivalent where clause for db.
 */
const FILTER_VALUES_FOR_DB = {
  [TASKS_FILTERS_REQUEST_VALUES.TASK_TYPE_ASSIGNED]: {},
  [TASKS_FILTERS_REQUEST_VALUES.TASK_TYPE_CUSTOM]: {},
  [TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_CALL]: {
    type: NODE_TYPES.CALL,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_EMAIL]: {
    type: NODE_TYPES.MAIL,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_SMS]: {
    type: NODE_TYPES.MESSAGE,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_LINKEDIN_CONNECTION]: {
    type: NODE_TYPES.LINKEDIN_CONNECTION,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_LINKEDIN_MESSAGE]: {
    type: NODE_TYPES.LINKEDIN_MESSAGE,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_LINKEDIN_PROFILE]: {
    type: NODE_TYPES.LINKEDIN_PROFILE,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_LINKEDIN_INTERACT]: {
    type: NODE_TYPES.LINKEDIN_INTERACT,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_DATA_CHECK]: {
    type: NODE_TYPES.DATA_CHECK,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_CADENCE_CUSTOM]: {
    type: NODE_TYPES.CADENCE_CUSTOM,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_REPLY_TO]: {
    type: NODE_TYPES.REPLY_TO,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_WHATSAPP]: {
    type: NODE_TYPES.WHATSAPP,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_COMPLETION_DUE]: {
    completed: 0, // TODO:TASK MIGRATION
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_COMPLETION_DONE]: {
    completed: 1, // TODO:TASK MIGRATION
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_COMPLETION_SCHEDULED]: {
    status: TASK_STATUSES.SCHEDULED,
  },
  //[TASKS_FILTERS_REQUEST_VALUES.COMPANY_SIZE_1_10]: {
  //size: ACCOUNT_SIZE[110],
  //},
  //[TASKS_FILTERS_REQUEST_VALUES.COMPANY_SIZE_11_50]: {
  //size: ACCOUNT_SIZE[1150],
  //},
  //[TASKS_FILTERS_REQUEST_VALUES.COMPANY_SIZE_51_200]: {
  //size: ACCOUNT_SIZE[51200],
  //},
  //[TASKS_FILTERS_REQUEST_VALUES.COMPANY_SIZE_201_500]: {
  //size: ACCOUNT_SIZE[201500],
  //},
  //[TASKS_FILTERS_REQUEST_VALUES.COMPANY_SIZE_501_1000]: {
  //size: ACCOUNT_SIZE[5011000],
  //},
  //[TASKS_FILTERS_REQUEST_VALUES.COMPANY_SIZE_1001_5000]: {
  //size: ACCOUNT_SIZE[10015000],
  //},
  //[TASKS_FILTERS_REQUEST_VALUES.COMPANY_SIZE_5000_10000]: {
  //size: ACCOUNT_SIZE[500010000],
  //},
  //[TASKS_FILTERS_REQUEST_VALUES.COMPANY_SIZE_10000]: {
  //size: ACCOUNT_SIZE[10000],
  //},
  [TASKS_FILTERS_REQUEST_VALUES.FAVOURITE]: {},
  [TASKS_FILTERS_REQUEST_VALUES.TASK_DATE_CREATION_TODAY]: (timezone) => [
    UserHelper.setHoursForTimezone(0, new Date().getTime(), timezone),
    UserHelper.setHoursForTimezone(24, new Date().getTime(), timezone),
  ],
  [TASKS_FILTERS_REQUEST_VALUES.TASK_DATE_CREATION_YESTERDAY]: (timezone) => [
    UserHelper.setHoursForTimezone(-24, new Date().getTime(), timezone),
    UserHelper.setHoursForTimezone(0, new Date().getTime(), timezone),
  ],
  [TASKS_FILTERS_REQUEST_VALUES.TASK_TAG_URGENT]: {
    is_urgent: 1,
  },
  [TASKS_FILTERS_REQUEST_VALUES.TASK_TAG_LATE]: {
    late_time: {
      [Op.lte]: new Date().getTime(),
    },
  },
  [TASKS_FILTERS_REQUEST_VALUES.LEAD_TAG_HOT]: {
    lead_warmth: LEAD_WARMTH.HOT,
  },
};

/*
 * getFilterValuesForDb will return db query for a filter.
 * since some filters needs there query as Op.between,
 * which was hard to do in above json hence we are using passing each filter through this function.
 * */
const getFilterValuesForDb = (filter, timezone) => {
  // * filter should always be validated in calling function
  if (filter === TASKS_FILTERS_REQUEST_VALUES.TASK_DATE_CREATION_TODAY)
    return {
      start_time: {
        [Op.between]:
          FILTER_VALUES_FOR_DB[
            TASKS_FILTERS_REQUEST_VALUES.TASK_DATE_CREATION_TODAY
          ](timezone),
      },
    };
  else if (filter === TASKS_FILTERS_REQUEST_VALUES.TASK_DATE_CREATION_YESTERDAY)
    return {
      start_time: {
        [Op.between]:
          FILTER_VALUES_FOR_DB[
            TASKS_FILTERS_REQUEST_VALUES.TASK_DATE_CREATION_YESTERDAY
          ](timezone),
      },
    };
  return FILTER_VALUES_FOR_DB[filter] || {};
};

// Object.values(TASKS_FILTERS_REQUEST_VALUES).map((filter) =>
//   console.log(filter, getFilterValuesForDb(filter))
// );

// getTaskFiltersV2 will get filtersObject from frontend and will return its equivalent object, containing queries for each filters.
const getTaskFiltersV2 = (filtersObject, timezone) => {
  try {
    // * to store result
    let filtersObjectForDb = {};

    if (!filtersObject) return [null, `Invalid filter provided.`];

    // * All valid keys that can be processed
    const VALID_FILTER_KEYS = Object.values(TASKS_FILTERS_REQUEST_KEYS);

    // * Loop through each filter
    Object.keys(filtersObject)?.map((filterKey) => {
      let filterValues = {};
      // * If filter is valid, then only process it
      if (VALID_FILTER_KEYS.includes(filterKey)) {
        // * if filter if for task action, create a array of node types
        if (filterKey === TASKS_FILTERS_REQUEST_KEYS.TASK_ACTION) {
          let nodeTypes = [];
          filtersObject[filterKey]?.map((filter) => {
            const filterValueForDb = getFilterValuesForDb(filter);
            if (filterValueForDb?.type) nodeTypes.push(filterValueForDb?.type);
          });

          // if empty array is passed in Op.in then nothing will be fetched, hence check for length of array.
          if (nodeTypes?.length)
            filterValues = {
              type: {
                [Op.in]: nodeTypes,
              },
            };
          else filterValues = {};

          filtersObjectForDb = {
            ...filtersObjectForDb,
            node: {
              ...filtersObjectForDb?.node,
              ...filterValues,
            },
          };
        } else if (filterKey === TASKS_FILTERS_REQUEST_KEYS.COMPANY_SIZE) {
          // * if filter if for task action, create a array of account sizes

          let accountSizes = filtersObject[filterKey]; // can be an array or an string

          //filtersObject[filterKey]?.map((filter) => {
          //const filterValueForDb = getFilterValuesForDb(filter);
          //if (filterValueForDb?.size)
          //accountSizes.push(filterValueForDb?.size);
          //});

          // if empty array is passed in Op.in then nothing will be fetched, hence check for length of array.
          if (Array.isArray(accountSizes) && accountSizes?.length)
            // if it is an array
            filterValues = {
              size: {
                [Op.in]: accountSizes,
              },
            };
          else if (typeof accountSizes === 'string')
            // if it is an string
            filterValues = {
              size: accountSizes,
            };
          else filterValues = {}; // if its not an array or string

          filtersObjectForDb = {
            ...filtersObjectForDb,
            account: filterValues,
          };
        } else if (filterKey === TASKS_FILTERS_REQUEST_KEYS.TASK_CADENCES) {
          // value for this key should be an array of cadence ids
          if (filtersObject[filterKey]?.length)
            filtersObjectForDb = {
              ...filtersObjectForDb,
              task: {
                ...filtersObjectForDb?.task,
                cadence_id: {
                  [Op.in]: filtersObject[filterKey],
                },
              },
            };
        } else if (filterKey === TASKS_FILTERS_REQUEST_KEYS.LEAD_TIMEZONES) {
          // value for this key should be an array of timezones
          if (filtersObject[filterKey]?.length)
            filtersObjectForDb = {
              ...filtersObjectForDb,
              lead_phone_number: {
                timezone: { [Op.in]: filtersObject[filterKey] },
                is_primary: true,
              },
            };
        } else if (filterKey === TASKS_FILTERS_REQUEST_KEYS.TASK_TAG) {
          filtersObject[filterKey]?.map((filter) => {
            const filterValueForDb = getFilterValuesForDb(filter);
            if (filter === TASKS_FILTERS_REQUEST_VALUES.TASK_TAG_LATE)
              filtersObjectForDb = {
                ...filtersObjectForDb,
                task: {
                  ...filtersObjectForDb?.task,
                  ...filterValueForDb,
                },
              };
            else if (filter === TASKS_FILTERS_REQUEST_VALUES.TASK_TAG_URGENT)
              filtersObjectForDb = {
                ...filtersObjectForDb,
                node: {
                  ...filtersObjectForDb?.node,
                  ...filterValueForDb,
                },
              };
          });
        } else if (filterKey === TASKS_FILTERS_REQUEST_KEYS.TASK_STEP) {
          // * if filter if for task step, create a array of steps

          let steps = filtersObject[filterKey]; // can be an array or an string

          //filtersObject[filterKey]?.map((filter) => {
          //const filterValueForDb = getFilterValuesForDb(filter);
          //if (filterValueForDb?.size)
          //accountSizes.push(filterValueForDb?.size);
          //});

          // if empty array is passed in Op.in then nothing will be fetched, hence check for length of array.
          if (Array.isArray(steps) && steps?.length)
            // if it is an array
            filterValues = {
              step_number: {
                [Op.in]: steps,
              },
            };
          else if (['string', 'number'].includes(typeof steps))
            // if it is an string
            filterValues = {
              step_number: steps,
            };
          else filterValues = {}; // if its not an array or string

          filtersObjectForDb = {
            ...filtersObjectForDb,
            node: {
              ...filtersObjectForDb?.node,
              ...filterValues,
            },
          };
        } else {
          // all filters who does not require special operator(Op.*), will come here
          const filterValueForDb = getFilterValuesForDb(
            filtersObject[filterKey]?.[0],
            timezone
          );

          // all these map to query for task, so while adding query for any filter, maintain its previous filter's values.
          if (
            [
              TASKS_FILTERS_REQUEST_KEYS.TASK_TYPE,
              TASKS_FILTERS_REQUEST_KEYS.TASK_DATE_CREATION,
              TASKS_FILTERS_REQUEST_KEYS.TASK_COMPLETION,
            ].includes(filterKey)
          )
            filtersObjectForDb = {
              ...filtersObjectForDb,
              task: {
                ...filtersObjectForDb?.task,
                ...filterValueForDb,
              },
            };

          if ([TASKS_FILTERS_REQUEST_KEYS.LEAD_TAG].includes(filterKey))
            filtersObjectForDb = {
              ...filtersObjectForDb,
              lead: {
                ...filtersObjectForDb?.lead,
                ...filterValueForDb,
              },
            };
        }
      } else {
        logger.error(`Invalid filter: ${filterKey}.`);
      }
    });
    return [filtersObjectForDb, null];
  } catch (err) {
    logger.error(`Error while fetching task filters v2`, err);
    return [null, err.message];
  }
};

//let filtersObj = {
//task_type: [TASKS_FILTERS_REQUEST_VALUES.TASK_TYPE_CUSTOM],
//task_tag: [
////TASKS_FILTERS_REQUEST_VALUES.TASK_TAG_LATE,
////TASKS_FILTERS_REQUEST_VALUES.TASK_TAG_URGENT,
//],
//task_action: [
//TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_CALL,
//TASKS_FILTERS_REQUEST_VALUES.TASK_ACTION_SMS,
//],
//task_completion: [TASKS_FILTERS_REQUEST_VALUES.TASK_COMPLETION_DONE],
////company_size: [
////TASKS_FILTERS_REQUEST_VALUES.COMPANY_SIZE_MICRO,
////TASKS_FILTERS_REQUEST_VALUES.COMPANY_SIZE_SMALL,
////],
//company_size: [],
//task_date_creation: [
//TASKS_FILTERS_REQUEST_VALUES.TASK_DATE_CREATION_YESTERDAY,
//],
//task_cadences: [],
//task_step: '1',
//lead_tag: [TASKS_FILTERS_REQUEST_VALUES.LEAD_TAG_HOT],
//};

//console.log(getTaskFiltersV2(filtersObj, 'Asia/Kolkata')[0]?.lead);

module.exports = { getTaskFilters, getTaskFiltersV2 };
