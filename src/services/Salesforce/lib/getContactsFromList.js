// Packages
const logger = require('../../../utils/winston');
const axios = require('axios');

const getContactsFromList = async (
  list_id,
  page_offset,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Contact/listviews/${list_id}/results/?offset=${page_offset}&limit=2000`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while fetching contact list from salesforce: `, err);
    console.log(err?.response);
    console.log(err?.response?.data);

    if (err?.response?.data?.[0]?.message)
      return [null, err?.response?.data[0]?.message];
    else return [null, err.message];
  }
};

module.exports = { getContactsFromList };
