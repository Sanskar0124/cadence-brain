// Utils
const logger = require('../../utils/winston');
const {
  LEADS_FILTER_KEYS,
  LEADS_FILTER_VALUES,
  LEAD_STATUS,
  ACTIVITY_TYPE,
  LEAD_WARMTH,
} = require('../../utils/enums');

const FILTER_VALUES_FOR_DB = {
  [LEADS_FILTER_VALUES.LEAD_TAGS_NEW]: {
    status: LEAD_STATUS.NEW_LEAD,
  },
  [LEADS_FILTER_VALUES.LEAD_TAGS_CONVERTED]: {
    status: LEAD_STATUS.CONVERTED,
  },
  [LEADS_FILTER_VALUES.LEAD_TAGS_DISQUALIFIED]: {
    status: LEAD_STATUS.TRASH,
  },
};

const getLeadsListFilterForRawQuery = (filtersObject, user_id) => {
  try {
    // * to store result
    let filtersObjectForDb = {
      lead_query: '',
      account_query: '',
    };
    let lead_query = [];
    let lead_statuses = [];
    let account_query = [];
    let account_sizes = [];

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
          filtersObject[filterKey]?.map((filter) => {
            if (filter === LEADS_FILTER_VALUES.LEAD_TAGS_DUPLICATED)
              lead_query.push('duplicate = 1');
            if (filter === LEADS_FILTER_VALUES.LEAD_TAGS_HOT)
              lead_query.push(`lead_warmth = '${LEAD_WARMTH.HOT}'`);
            if (
              [
                LEADS_FILTER_VALUES.LEAD_TAGS_NEW,
                LEADS_FILTER_VALUES.LEAD_TAGS_CONVERTED,
                LEADS_FILTER_VALUES.LEAD_TAGS_DISQUALIFIED,
              ]?.includes(filter)
            )
              lead_statuses.push(FILTER_VALUES_FOR_DB?.[filter]?.status);
          });
          if (lead_statuses?.length)
            lead_query.push('status in (:lead_statuses)');
        } else if (filterKey === LEADS_FILTER_KEYS.COMPANY_SIZE) {
          // * if filter is for company size, create a array of account sizes

          let accountSizes = filtersObject[filterKey];
          account_sizes = accountSizes;

          // if empty array is passed in Op.in then nothing will be fetched, hence check for length of array.
          if (Array.isArray(accountSizes) && accountSizes?.length)
            account_query.push('size in (:account_sizes)');
        } else {
          logger.error(`Invalid filter: ${filterKey}.`);
        }
      }
    });

    lead_query.push(` \`Lead\`.user_id = :user_id`);

    if (lead_query) lead_query = lead_query.join(' and ');
    if (account_query) account_query = account_query.join(' and ');

    filtersObjectForDb.lead_query = lead_query;
    filtersObjectForDb.account_query = account_query;
    filtersObjectForDb.replacements = {
      lead_statuses,
      account_sizes,
      user_id,
    };

    return [filtersObjectForDb, null];
  } catch (err) {
    logger.error(`Error while fetching leads list filter: `, err);
    return [null, err.message];
  }
};

//console.log(
//getLeadsListFilterForRawQuery({
//[LEADS_FILTER_KEYS.LEAD_TAGS]: [LEADS_FILTER_VALUES.LEAD_TAGS_DISQUALIFIED],
//})
//);

module.exports = getLeadsListFilterForRawQuery;
