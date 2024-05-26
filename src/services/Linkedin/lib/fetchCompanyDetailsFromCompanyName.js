// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const fetchCompanyDetailsFromCompanyName = async (companyName, headers) => {
  try {
    let params = {
      decorationId:
        'com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-12',
      q: 'universalName',
      universalName: companyName,
    };
    logger.info(`Fetching details for company: ${companyName}`);

    const url = 'https://www.linkedin.com/voyager/api/organization/companies';
    const res = await axios.get(url, {
      headers,
      params,
    });
    const data = res?.data;

    let staffCount = parseInt(data?.['elements']?.[0]?.['staffCount']) || '';

    if (staffCount >= 1 && staffCount <= 10) {
      staffCount = '1-10';
    } else if (staffCount >= 11 && staffCount <= 50) {
      staffCount = '11-50';
    } else if (staffCount >= 51 && staffCount <= 200) {
      staffCount = '51-200';
    } else if (staffCount >= 201 && staffCount <= 500) {
      staffCount = '201-500';
    } else if (staffCount >= 501 && staffCount <= 1000) {
      staffCount = '501-1000';
    } else if (staffCount >= 1001 && staffCount <= 5000) {
      staffCount = '1001-5000';
    } else if (staffCount >= 5001 && staffCount <= 10000) {
      staffCount = '5000-10 000';
    } else if (staffCount > 10000) {
      staffCount = '+10 000';
    } else {
      staffCount = '';
    }

    const companyLocations = data?.['elements']?.[0]?.['confirmedLocations'];
    const companyPhone = data?.['elements']?.[0]?.['phone']?.['number'];
    const companyFoundedYear = data?.['elements']?.[0]?.['foundedOn']?.['year'];

    const companyHq = companyLocations.filter((c) => c?.['headquarter']);
    const entityUrn = data?.['elements']?.[0]?.entityUrn.split(':')[3];

    let companyCity = '';
    let companyCountry = '';
    let companyState = '';
    let companyLocation = '';
    let companyPostal = '';

    let companyIndustry =
      data?.['elements']?.[0]?.['companyIndustries']?.[0]?.['localizedName'];

    if (companyHq?.length) {
      const Hq = companyHq[0];
      companyCity = Hq?.['city'];
      companyCountry = Hq?.['country'];
      companyState = Hq?.['geographicArea'];
      companyPostal = Hq?.['postalCode'];
      if (Hq?.['line1']) companyLocation = `${Hq?.['line1']}`;
      if (companyLocation) {
        if (companyCity) companyLocation = companyLocation + `, ${companyCity}`;
        if (companyState)
          companyLocation = companyLocation + `, ${companyState}`;
        if (companyPostal)
          companyLocation = companyLocation + `, ${companyPostal}`;
        if (companyCountry)
          companyLocation = companyLocation + `, ${companyCountry}`;
      }
    }

    const result = {
      id: entityUrn,
      city: companyCity || '',
      country: companyCountry || '',
      state: companyState || '',
      size: staffCount || '',
      zip_code: companyPostal || '',
      industry: companyIndustry || '',
      location: companyLocation || '',
      phone_number: companyPhone || '',
      founded_year: companyFoundedYear || '',
    };

    logger.info(`Fetched details for company: ${companyName}`);

    return [result, null];
  } catch (err) {
    logger.error(
      `Error while fetching company details from company name: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = fetchCompanyDetailsFromCompanyName;
