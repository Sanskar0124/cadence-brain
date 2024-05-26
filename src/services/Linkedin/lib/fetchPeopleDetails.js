// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

// Helpers and Services
const fetchCompanyDetailsFromCompanyName = require('./fetchCompanyDetailsFromCompanyName');

const fetchPeopleDetails = async (peopleUrn, headers) => {
  try {
    if (!peopleUrn) return [null, `Empty profile received.`];
    // get url from people Urn
    //let url = peopleUrn?.split('(')?.pop();
    let url = peopleUrn.split('/')[4];
    logger.info(`url: ${url}`);

    // get details from linkedin
    const res = await axios.get(
      `https://www.linkedin.com/voyager/api/identity/profiles/${url}/profileView`, // url
      { headers } // headers
    );
    const data = res?.data;
    //console.log(JSON.stringify(data, null, 4));

    // Personal details
    const { firstName, lastName, publicIdentifier, occupation, objectUrn } =
      data?.['profile']?.['miniProfile'] || {};
    const public_id = publicIdentifier;
    const member_urn_id = objectUrn.split(':').pop();
    const fullName = `${firstName} ${lastName}`;
    const location = data?.['profile']?.['geoCountryName'];
    const linkedinUrl = `https://linkedin.com/in/${publicIdentifier}`;

    // Fetch company details
    let companyName =
        data?.['positionGroupView']?.['elements']?.[0]?.['miniCompany']?.name ||
        '',
      companySocialUrl = '',
      companyUrl = '';
    let companyResult = {};

    if (
      data?.['positionGroupView']?.['elements']?.[0]?.['miniCompany'] &&
      data?.['positionGroupView']?.['elements']?.[0]?.['miniCompany']?.active
    ) {
      const companyUrnId = data['positionGroupView']['elements'][0][
        'miniCompany'
      ]?.['entityUrn']
        ?.split(':')
        ?.pop();

      const companyData = await axios.get(
        `https://www.linkedin.com/voyager/api/entities/companies/${companyUrnId}`,
        { headers }
      );

      companyName =
        companyData?.['data']?.['basicCompanyInfo']?.['miniCompany']?.['name'];
      companySocialUrl = `https://www.linkedin.com/company/${companyUrnId}`;
      companyUrl = companyData?.['data']?.['websiteUrl'];

      const companyUniversalName =
        data?.['positionGroupView']?.['elements']?.[0]?.['miniCompany']
          ?.universalName;

      [companyResult, _] = await fetchCompanyDetailsFromCompanyName(
        companyUniversalName,
        headers
      );
    }

    const result = {
      first_name: firstName || '',
      last_name: lastName || '',
      full_name: fullName || '',
      location: location || '',
      job_position: occupation || '',
      linkedin_url: linkedinUrl || '',
      public_id,
      member_urn_id,
      account: {
        name: companyName || '',
        url: companyUrl || '',
        linkedin_url: companySocialUrl,
        ...companyResult,
      },
    };

    return [result, null];
  } catch (err) {
    logger.error(`Error while fetching people details from linkedin: `, err);
    return [null, err.message];
  }
};

module.exports = fetchPeopleDetails;
