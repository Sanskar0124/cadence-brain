//Utils
const { ZOHO_MODULE } = require('../../../utils/enums');
// Packages
const logger = require('../../../utils/winston');
const axios = require('axios');

const fetchModuleByViewId = async ({
  access_token,
  instance_url,
  viewId,
  offset,
  moduleName,
  fields,
}) => {
  try {
    if (!Object.values(ZOHO_MODULE).includes(moduleName))
      return [null, `Invalid Module Name ${moduleName}`];

    let URL = `${instance_url}/crm/v2/${moduleName}`;
    const params = {
      per_page: 200,
      page: offset / 200 + 1,
      cvid: viewId,
      fields,
    };
    const { data } = await axios.get(URL, {
      params,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data ? data.data : [], null];
  } catch (err) {
    if (err?.response?.data?.data?.[0]?.message) {
      logger.error(
        `Error while fetching records from view ${viewId}`,
        err?.response?.data?.data?.[0]?.message
      );
      return [null, err?.response?.data?.data?.[0]?.message];
    } else if (err?.response?.data?.message) {
      logger.error(
        `Error while fetching records from view ${viewId}: `,
        err?.response?.data?.message
      );
      return [null, err?.response?.data?.message];
    }
    logger.error(`Error while fetching records from view ${viewId}`, err);
    return [null, err.message];
  }
};

module.exports = fetchModuleByViewId;
