// Packages
const logger = require('../../../utils/winston');
const axios = require('axios');

const fetchCustomViewById = async ({
  access_token,
  instance_url,
  viewId,
  moduleName,
}) => {
  try {
    if (!Object.values(ZOHO_MODULE).includes(moduleName))
      return [null, `Invalid Module Name ${moduleName}`];

    let URL = `${instance_url}/crm/v2/settings/custom_views/${viewId}?module=${moduleName}`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    if (err?.response?.data?.data?.[0]?.message) {
      logger.error(
        `Error while fetching custom view by id ${viewId}`,
        err?.response?.data?.data?.[0]?.message
      );
      return [null, err?.response?.data?.data?.[0]?.message];
    } else if (err?.response?.data?.message) {
      logger.error(
        `Error while fetching custom view by ${viewId}: `,
        err?.response?.data?.message
      );
      return [null, err?.response?.data?.message];
    }
    logger.error(`Error while fetching custom view by id ${viewId}`, err);
    return [null, err.message];
  }
};

module.exports = fetchCustomViewById;
