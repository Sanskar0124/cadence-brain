// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const searchCompany = async ({ access_token, fields, body }) => {
  try {
    let [companies, errForCompanies] = await searchPaginatedCompany({
      access_token,
      fields,
      body,
    });
    if (errForCompanies) return [null, errForCompanies];

    let promises = [];

    if (companies.pagination.limit < companies.pagination.total) {
      let offset = companies.pagination.limit;
      const total = companies.pagination.total;
      while (offset < total) {
        promises.push(
          searchPaginatedCompany({
            access_token,
            fields,
            body,
            offset,
          })
        );
        offset += companies.pagination.limit;
      }

      const allData = await Promise.all(promises);

      for (let i = 0; i < allData.length; i++) {
        const newList = allData[i][0]?.data;
        if (newList?.length) {
          companies.data = companies?.data?.concat(newList);
        }
      }
    }

    return [companies.data, null];
  } catch (err) {
    logger.error('Error while searching Company for sellsy: ', err);
    return [null, err.message];
  }
};

const searchPaginatedCompany = async ({
  access_token,
  fields,
  body,
  offset = 0,
}) => {
  try {
    let url = `https://api.sellsy.com/v2/companies/search?limit=100&offset=${offset}`;
    if (fields) url += `&${fields}`;

    const { data } = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    return [null, err?.response?.data?.error?.message];
  }
};

module.exports = searchCompany;
