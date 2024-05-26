const axios = require('axios');

// * Util Imports
const logger = require('../../../utils/winston');

const JsonHelper = require('../../../helper/json');

const searchPersons = async ({
  access_token,
  instance_url,
  search_term,
  organization_id,
  include_fields,
  fields = 'name,email', // e.g. "name" | "name,email"
  start = 0,
  limit = null,
  exact_match = true,
}) => {
  try {
    const params = {
      term: search_term,
      fields,
      organization_id,
      include_fields,
      start,
      limit,
      exact_match,
    };

    const { data } = await axios.get(`${instance_url}/v1/persons/search`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: JsonHelper.clean(params),
    });

    return [data.data?.items ?? [], null];
  } catch (err) {
    logger.error('Error while searching persons in pipedrive: ', err);
    return [null, err.message];
  }
};

module.exports = searchPersons;
