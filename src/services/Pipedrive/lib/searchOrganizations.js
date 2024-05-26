const axios = require('axios');

// * Util Imports
const logger = require('../../../utils/winston');

const JsonHelper = require('../../../helper/json');

const searchOrganizations = async ({
  access_token,
  instance_url,
  search_term,
  fields = 'name',
  start = 0,
  limit = null,
  exact_match = true,
}) => {
  try {
    const params = {
      term: search_term,
      fields,
      start,
      limit,
      exact_match,
    };
    const { data } = await axios.get(
      `${instance_url}/v1/organizations/search`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: JsonHelper.clean(params),
      }
    );

    return [data.data?.items ?? [], null];
  } catch (err) {
    logger.error('Error while searching organizations in pipedrive: ', err);
    return [null, err.message];
  }
};

module.exports = searchOrganizations;
