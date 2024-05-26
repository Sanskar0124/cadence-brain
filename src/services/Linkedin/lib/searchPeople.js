//Utils
const logger = require('../../../utils/winston');

//Helpers
const search = require('./search');
const fetchHeaders = require('./fetchHeaders');
const { query } = require('express');
// const fetchCompanyDetailsFromCompanyName = require('./fetchCompanyDetailsFromCompanyName');

const searchPeople = async ({
  headers,
  limit,
  offset,
  search_url,
  custom_filters,
}) => {
  try {
    const rawParams = search_url.split('?')[1];
    let linkedinParams = new URLSearchParams(rawParams);
    let queryParams = { resultType: 'PEOPLE' };

    if (linkedinParams.has('geoUrn')) {
      const geoUrns = JSON.parse(linkedinParams.get('geoUrn'));
      queryParams.geoUrn = geoUrns;
    }
    if (linkedinParams.has('industry')) {
      const industries = JSON.parse(linkedinParams.get('industry'));
      queryParams.industry = industries.join(',');
    }
    if (linkedinParams.has('currentCompany') || custom_filters?.company) {
      const currentCompany =
        JSON.parse(linkedinParams.get('currentCompany')) ||
        custom_filters?.company;
      queryParams.currentCompany = currentCompany.join(',');
    }
    if (linkedinParams.has('pastCompany')) {
      const pastCompanies = JSON.parse(linkedinParams.get('pastCompany'));
      queryParams.pastCompany = pastCompanies.join(',');
    }
    if (linkedinParams.has('profileLanguage')) {
      const profileLanguages = JSON.parse(
        linkedinParams.get('profileLanguage')
      );
      queryParams.profileLanguage = profileLanguages.join(',');
    }

    if (linkedinParams.has('schoolFilter')) {
      const schools = JSON.parse(linkedinParams.get('schoolFilter'));
      queryParams.schools = schools.join(',');
    }
    if (linkedinParams.has('serviceCategory')) {
      const serviceCategories = JSON.parse(
        linkedinParams.get('serviceCategory')
      );
      queryParams.serviceCategory = serviceCategories.join(',');
    }
    if (linkedinParams.has('firstName')) {
      const keywordFirstName = linkedinParams.get('firstName');
      queryParams.firstName = keywordFirstName;
    }
    if (linkedinParams.has('lastName')) {
      const keywordLastName = linkedinParams.get('lastName');
      queryParams.lastName = keywordLastName;
    }
    if (linkedinParams.has('titleFreeText') || custom_filters?.title) {
      const keywordTitle =
        linkedinParams.get('titleFreeText') || custom_filters?.title.join(',');
      queryParams.title = keywordTitle;
    }

    if (linkedinParams.has('schoolFreetext')) {
      const keywordSchool = linkedinParams.get('schoolFreetext');
      queryParams.school = keywordSchool;
    }

    // Perform the search and return the results

    let query = {};
    if (linkedinParams.has('keywords')) {
      var keywords = linkedinParams.get('keywords');
      query.keywords = keywords;
    }
    query.queryParameters = queryParams;

    const [results, errForData] = await search({
      limit,
      headers,
      offset,
      query,
    });
    if (errForData) return [null, errForData];

    return [results.map((id) => `https://www.linkedin.com/in/${id}`), null];
  } catch (err) {
    logger.error('error while searching people:', err);
    return [null, err.message];
  }
};

module.exports = searchPeople;

// const cookie =
//   'AQEDASnZT5YBQudVAAABiLTEXPkAAAGI2NDg-U0AauYcPxETgkSj4J8z4zegjmTEyBUzAbiMzOnGwA-7rRqi9e5TzqFD8ruxT4v_hxA1XamflPtHrU3xoTMPUi2gOuseCqqZ0MKX8OTTmkMbIfsWZPkh';
// fetchHeaders(cookie).then(async ([headers, rest]) => {
//   searchPeople({
//     headers,
//     limit: 10,
//     offset: 0,
//     search_url:
//       'https://www.linkedin.com/search/results/people/?keywords=cfo&origin=SWITCH_SEARCH_VERTICAL&sid=%2Cax',
//   }).then(console.log);
// });
