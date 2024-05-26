//Utils
const logger = require('../../../utils/winston');

//Packages
const axios = require('axios');

//Parsers
const searchUrlParser = require('../../../helper/linkedin/searchUrlParser');

const search = async ({
  query,
  max_count = 50,
  headers,
  limit = 10,
  offset = 0,
}) => {
  try {
    let count = max_count;
    let results = [];
    while (true) {
      if (limit > -1 && limit - results.length < count) {
        count = limit - results.length;
      }
      let defaultParams = {
        start: results.length + offset,
        count: count?.toString(),
        query: {
          flagshipSearchIntent: 'SEARCH_SRP',
          includeFiltersInResponse: false,
        },
      };
      if (defaultParams.start > 10) return;
      Object.assign(defaultParams.query, query);

      let queryString = _encodeUrl(defaultParams);
      queryString += `&queryId=voyagerSearchDashClusters.c4f33252de52295107ac12f946d34b0d`;

      let [data, errForData] = await _fetch(`${queryString}`, headers);
      if (errForData) return [null, errForData];

      const prasedRes = searchUrlParser(data.data);
      results = [...results, ...prasedRes];

      if (
        (limit > -1 && limit <= results.length) ||
        results.length / count >= 200 ||
        data.included.length === 0
      ) {
        break;
      }
    }
    return [results, null];
  } catch (err) {
    logger.error('error while searching url:', err);
    return [null, err];
  }
};

module.exports = search;

const _fetch = async (url, headers) => {
  const URL = 'https://www.linkedin.com/voyager/api/graphql?variables=' + url;
  try {
    const res = await axios.get(URL, {
      headers: {
        accept: 'application/vnd.linkedin.normalized+json+2.1',
        ...headers,
      },
    });
    return [res, null];
  } catch (error) {
    logger.error('error while fetching profiles:', error);
    return [null, error.message];
  }
};

function _encodeQuery(params) {
  let paramString = '';
  Object.keys(params).forEach((key, i) => {
    const value = params[key];
    paramString +=
      `(key:${key},value:List(${value}))` +
      (i !== Object.keys(params).length - 1 ? ',' : '');
  });
  return `List(${paramString})`;
}

function _encodeUrl(params) {
  let paramString = '';

  Object.keys(params).forEach((key, index) => {
    const value = params[key];
    paramString += `${key}:`;

    if (key === 'queryParameters') paramString += _encodeQuery(value);
    else if (typeof value === 'object') paramString += _encodeUrl(value);
    else paramString += `${value}`;
    if (index !== Object.keys(params).length - 1) paramString += ',';
  });
  return `(${paramString})`;
}
