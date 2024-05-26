const axios = require('axios');

// * Util Imports
const logger = require('../../../utils/winston');

const getAllPersons = async ({
  access_token,
  instance_url,
  user_id,
  filter_id,
  first_char,
  start,
  limit,
  sort,
}) => {
  try {
    let parameters = new URLSearchParams();
    if (user_id) parameters.append('user_id', user_id);
    if (filter_id) parameters.append('filter_id', filter_id);
    if (first_char) parameters.append('first_char', first_char);
    if (start) parameters.append('start', start);
    if (limit) parameters.append('limit', limit);
    if (sort) parameters.append('sort', sort);

    const { data } = await axios.get(
      `${instance_url}/v1/persons?${parameters}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return [data, null];
  } catch (err) {
    logger.error(
      `An error occurred while trying to fetch all person from Pipedrive: `,
      err
    );
    return [null, err];
  }
};

module.exports = {
  getAllPersons,
};
