// Utils
const logger = require('../../utils/winston');
const {
  LEADS_FILTER_KEYS,
  LEADS_FILTER_VALUES,
  LEAD_STATUS,
  ACTIVITY_TYPE,
  LEAD_WARMTH,
} = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

/**
 * * Key will have a valid filter value for task
 * * Value will be an object which will be equivalent where clause for db.
 */
const FILTER_VALUES_FOR_DB = {
  [LEADS_FILTER_VALUES.LEAD_TAGS_DUPLICATED]: {
    duplicate: 1,
  },
  [LEADS_FILTER_VALUES.LEAD_TAGS_NEW]: {
    status: LEAD_STATUS.NEW_LEAD,
  },
  [LEADS_FILTER_VALUES.LEAD_TAGS_CONVERTED]: {
    status: LEAD_STATUS.CONVERTED,
  },
  [LEADS_FILTER_VALUES.LEAD_TAGS_DISQUALIFIED]: {
    status: LEAD_STATUS.TRASH,
  },
  [LEADS_FILTER_VALUES.LEAD_TAGS_HOT]: {
    lead_warmth: LEAD_WARMTH.HOT,
  },
  //[LEADS_FILTER_VALUES.COMPANY_SIZE_1_10]: {
  //size: ACCOUNT_SIZE[110],
  //},
  //[LEADS_FILTER_VALUES.COMPANY_SIZE_11_50]: {
  //size: ACCOUNT_SIZE[1150],
  //},
  //[LEADS_FILTER_VALUES.COMPANY_SIZE_51_200]: {
  //size: ACCOUNT_SIZE[51200],
  //},
  //[LEADS_FILTER_VALUES.COMPANY_SIZE_201_500]: {
  //size: ACCOUNT_SIZE[201500],
  //},
  //[LEADS_FILTER_VALUES.COMPANY_SIZE_501_1000]: {
  //size: ACCOUNT_SIZE[5011000],
  //},
  //[LEADS_FILTER_VALUES.COMPANY_SIZE_1001_5000]: {
  //size: ACCOUNT_SIZE[10015000],
  //},
  //[LEADS_FILTER_VALUES.COMPANY_SIZE_5000_10000]: {
  //size: ACCOUNT_SIZE[500010000],
  //},
  //[LEADS_FILTER_VALUES.COMPANY_SIZE_10000]: {
  //size: ACCOUNT_SIZE[10000],
  //},
  [LEADS_FILTER_VALUES.LEAD_ACTIVITY_EMAIL]: {
    type: ACTIVITY_TYPE.MAIL,
  },
  [LEADS_FILTER_VALUES.LEAD_ACTIVITY_SMS]: {
    type: ACTIVITY_TYPE.MESSAGE,
  },
};

/*
 * getFilterValuesForDb will return db query for a filter.
 * since some filters needs there query as Op.between,
 * which was hard to do in above json hence we are using passing each filter through this function.
 * */
const getFilterValuesForDb = (filter, timezone) => {
  // * filter should always be validated in calling function
  return FILTER_VALUES_FOR_DB[filter] || {};
};

const getLeadsListFilter = (filtersObject, user_id) => {
  try {
    // * to store result
    let filtersObjectForDb = {};

    if (!filtersObject) return [null, `Invalid filter provided.`];

    // * All valid keys that can be processed
    const VALID_FILTER_KEYS = Object.values(LEADS_FILTER_KEYS);

    // * Loop through each filter
    Object.keys(filtersObject)?.map((filterKey) => {
      let filterValues = {};
      // * If filter is valid, then only process it
      if (VALID_FILTER_KEYS.includes(filterKey)) {
        // * if filter if for task action, create a array of node types
        if (filterKey === LEADS_FILTER_KEYS.LEAD_TAGS) {
          let leadStatuses = [];
          let leadQuery = {};
          filtersObject[filterKey]?.map((filter) => {
            const filterValueForDb = getFilterValuesForDb(filter);
            if (
              [
                LEADS_FILTER_VALUES.LEAD_TAGS_DUPLICATED,
                LEADS_FILTER_VALUES.LEAD_TAGS_HOT,
              ].includes(filter)
            )
              leadQuery = {
                ...leadQuery,
                ...filterValueForDb,
              };
            else {
              if (filterValueForDb?.status)
                leadStatuses.push(filterValueForDb?.status);
            }
          });

          // if empty array is passed in Op.in then nothing will be fetched, hence check for length of array.
          if (leadStatuses?.length)
            filterValues = {
              ...leadQuery,
              status: {
                [Op.in]: leadStatuses,
              },
            };
          else
            filterValues = {
              ...leadQuery,
            };

          filtersObjectForDb = {
            ...filtersObjectForDb,
            lead: filterValues,
          };
        } else if (filterKey === LEADS_FILTER_KEYS.COMPANY_SIZE) {
          // * if filter is for company size, create a array of account sizes

          let accountSizes = filtersObject[filterKey];

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
          else if (typeof accountSizes === 'string') {
            // if it is an string
            filterValues = {
              size: accountSizes,
            };
          } else filterValues = {}; // if it is not an array or string

          filtersObjectForDb = {
            ...filtersObjectForDb,
            account: filterValues,
          };
        } else if (filterKey === LEADS_FILTER_KEYS.LEAD_CADENCES) {
          // value for this key should be an array of cadence ids
          if (filtersObject[filterKey]?.length)
            filtersObjectForDb = {
              ...filtersObjectForDb,
              cadence: {
                ...filtersObjectForDb?.cadence,
                cadence_id: {
                  [Op.in]: filtersObject[filterKey],
                },
              },
            };
        } else if (filterKey === LEADS_FILTER_KEYS.LEAD_ACTIVITY) {
          // * if filter is for lead activity, create a array of activity type          let accountSizes = [];

          let activityTypes = [];

          filtersObject[filterKey]?.map((filter) => {
            const filterValueForDb = getFilterValuesForDb(filter);
            if (filterValueForDb?.type)
              activityTypes.push(filterValueForDb?.type);
          });

          // if empty array is passed in Op.in then nothing will be fetched, hence check for length of array.
          if (activityTypes?.length)
            filterValues = {
              type: {
                [Op.in]: activityTypes,
              },
              read: 0, // fetch only unread activities
            };
          else filterValues = {};

          filtersObjectForDb = {
            ...filtersObjectForDb,
            activity: filterValues,
          };
        }
      } else {
        logger.error(`Invalid filter: ${filterKey}.`);
      }
    });

    filtersObjectForDb = {
      ...filtersObjectForDb,
      lead: {
        ...filtersObjectForDb.lead,
        user_id,
      },
    };
    return [filtersObjectForDb, null];
  } catch (err) {
    logger.error(`Error while fetching leads list filter: `, err);
    return [null, err.message];
  }
};

//const filtersObject = {
//lead_tags: [
//LEADS_FILTER_VALUES.LEAD_TAGS_HOT,
//LEADS_FILTER_VALUES.LEAD_TAGS_DUPLICATED,
//LEADS_FILTER_VALUES.LEAD_TAGS_CONVERTED,
//],
//company_size: '20-192',
//lead_cadences: [1, 2, 3],
//};

//console.log(getLeadsListFilter(filtersObject, 1)?.[0]?.lead);

module.exports = getLeadsListFilter;
