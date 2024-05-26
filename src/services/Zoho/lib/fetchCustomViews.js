//Uitls
const { ZOHO_MODULE } = require('../../../utils/enums');

// Packages
const logger = require('../../../utils/winston');
const axios = require('axios');

const fetchCustomViews = async ({ access_token, instance_url, moduleName }) => {
  try {
    if (!Object.values(ZOHO_MODULE).includes(moduleName))
      return [null, `Invalid Module Name ${moduleName}`];

    let URL = `${instance_url}/crm/v2/settings/custom_views?module=${moduleName}`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    if (err?.response?.data?.data?.[0]?.message) {
      logger.error(
        'Error while fetching custom views: ',
        err?.response?.data?.data?.[0]?.message
      );
      return [null, err?.response?.data?.data?.[0]?.message];
    } else if (err?.response?.data?.message) {
      logger.error(
        `Error while fetching custom view: `,
        err?.response?.data?.message
      );
      return [null, err?.response?.data?.message];
    }
    logger.error('Error while fetching custom views: ', err);
    return [null, err.message];
  }
};

module.exports = fetchCustomViews;

// fetchCustomViews({
//   access_token:
//     '1000.e49b3eff364bf9648e5edd37bda77f21.cc174ae6cb3c36abc67eb3363fcffc0d',
//   instance_url: 'https://www.zohoapis.in',
//   moduleName: ZOHO_MODULE.CONTACT,
// })
//   .then(console.log)
//   .catch(console.error);
