const logger = require('../../../utils/winston');
const axios = require('axios');
const fetchSalesNavHeaders = require('./fetchSalesNavHeaders');

const fetchSalesNavPeople = async ({ search_url, headers, count, offset }) => {
  try {
    const URN_REGEX = /urn:li:fs_salesProfile:\((.+)\,.+\,.+\)/;
    const params = search_url
      .split('?')[1]
      .split('&')
      .reduce((prev, param) => {
        const [key, value] = param.split('=');
        if (!prev) return { [key]: value };
        else return { ...prev, [key]: value };
      }, {});
    const query = decodeURIComponent(params.query);
    const sessionId = params.sessionId;
    const API_URL = `https://www.linkedin.com/sales-api/salesApiLeadSearch?q=searchQuery&query=${query}&start=${offset}&count=${count}&trackingParam=(sessionId:${sessionId})&decorationId=com.linkedin.sales.deco.desktop.searchv2.LeadSearchResult-13`;
    const results = [];
    const res = await axios.get(API_URL, { headers });

    for (const element of res.data.elements) {
      const match = element.entityUrn.match(URN_REGEX);
      const urn = match ? match[1] : null;

      results.push(`https://www.linkedin.com/in/${urn}`);
    }
    return [results, null];
  } catch (err) {
    logger.error('Error while generating profile urls from search url:', err);
    return [null, err.message];
  }
};

module.exports = fetchSalesNavPeople;

// fetchSalesNavHeaders("AQEDAQkP8y0FiOi6AAABhqefX3UAAAGGy6vjdU4AQzbwRNZUMfrPqlMcKM05JHfBZORzfNIJN2M1-0OUv9krRWbvWC3Fvowf-ahVHfCEmiEWAee563pkMWSUw30b6vDhKemqwm8MtZMqiSWqH9g7dB5t","AQJ2PTEmc2FsZXNfY2lkPTEwODA3NTMxMDclM0ElM0E0NzYzNTYwMDfalCQfCQ7usNciKgzOh5yTXeKv_w")
// .then(([headers,err]) => {
//     fetchSalesNavPeople({
//         search_url : "https://www.linkedin.com/sales/search/people?page=5&query=(spellCorrectionEnabled%3Atrue%2CrecentSearchParam%3A(id%3A2280091626%2CdoLogHistory%3Atrue)%2Ckeywords%3Acto)&sessionId=mJjfIuOJQgepNu4k9qvCHg%3D%3D",
//         headers,
//         count: 25,
//         offset : 0
//     }).then(console.log)
// })
