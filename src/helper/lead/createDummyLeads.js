// Utils
const logger = require('../../utils/winston');
const { LEAD_INTEGRATION_TYPES } = require('../../utils/enums');

// Helpers
const createLeadForProductTour = require('./product-tour/createLeadForProductTour');

/**
 * creates dummy leads for a company which will be used for after onboarding product tour
 * @param {string} user_id - user to which leads will belong
 * @param {string} company_id - company to which leads will belong
 * @param {Object} cadence - cadence to which lead needs to be added
 * cadence id and status required in cadence object
 * @param {Object} node - first step of the node to create tasks if cadence is in progress
 * */
const createDummyLeads = async ({ user_id, company_id, cadence, node }) => {
  try {
    // Step: Function parameters validation checks
    if (!user_id || !company_id)
      return [null, `User id or company id not passed`];
    if (!cadence?.cadence_id || !cadence?.status)
      return [
        null,
        `parameter: cadence does not contain cadence id or cadence status`,
      ];

    // Step: Declaring varaibles
    let result = [];
    const leadCreationPromises = [];
    const leads = [
      //{
      //sr_no: 1,
      //first_name: 'Dummy',
      //last_name: 'dummy',
      //job_position: 'dummy',
      //linkedin_url: 'linkedin.com/people/dummy',
      //user_id,
      //emails: [{ is_primary: 0, email_id: 'dummy@gmail.com' }],
      //phone_numbers: [{ is_primary: 1, phone_number: 289832 }],
      //company: 'Dummy corp',
      //url: 'dummy.com',
      //size: '1-10',
      //zip_code: '239923',
      //country: 'Dum',
      //company_phone_number: 129239,
      //cadence_id: cadence.cadence_id,
      //cadenceStatus: cadence.status,
      //leadCadenceOrder: 1,
      //// hardcoded as of 11 Aug 2023 since the flow for onboarding is that every company will have sheets integration to start with
      //integration_type: LEAD_INTEGRATION_TYPES.ONBOARDING_EXCEL_LEAD,
      //},
      {
        sr_no: 1,
        first_name: 'Mike',
        last_name: 'Richardson',
        job_position: 'Sales Director',
        linkedin_url: 'https://www.linkedin.com/in/mike-richardson-654343281/',
        user_id,
        emails: [{ is_primary: 1, email_id: 'mike.richardson@ringover.com' }],
        phone_numbers: [{ is_primary: 1, phone_number: '+1 470 668 0629' }],
        company: 'B&Y Automative LLC',
        url: '',
        size: '',
        zip_code: '',
        country: '',
        company_phone_number: '',
        cadence_id: cadence.cadence_id,
        cadenceStatus: cadence.status,
        leadCadenceOrder: 1,
        // hardcoded as of 11 Aug 2023 since the flow for onboarding is that every company will have sheets integration to start with
        integration_type: LEAD_INTEGRATION_TYPES.ONBOARDING_EXCEL_LEAD,
      },
      {
        sr_no: 2,
        first_name: 'Wayne',
        last_name: 'Colby',
        job_position: 'VP of Marketing',
        linkedin_url: '',
        user_id,
        emails: [{ is_primary: 1, email_id: 'wayne.colby@ringover.com' }],
        phone_numbers: [{ is_primary: 1, phone_number: '+1 929 579 1361' }],
        company: 'Divestor',
        url: '',
        size: '',
        zip_code: '',
        country: '',
        company_phone_number: '',
        cadence_id: cadence.cadence_id,
        cadenceStatus: cadence.status,
        leadCadenceOrder: 2,
        // hardcoded as of 11 Aug 2023 since the flow for onboarding is that every company will have sheets integration to start with
        integration_type: LEAD_INTEGRATION_TYPES.ONBOARDING_EXCEL_LEAD,
      },
      {
        sr_no: 3,
        first_name: 'Chloe',
        last_name: 'Mills',
        job_position: 'Director of Procurement',
        linkedin_url: 'https://www.linkedin.com/in/chloe-mills-9a1355281/',
        user_id,
        emails: [{ is_primary: 1, email_id: 'chloe.mills@ringover.com' }],
        phone_numbers: [{ is_primary: 1, phone_number: '+1 706 309 1316' }],
        company: 'Scenture',
        url: '',
        size: '',
        zip_code: '',
        country: '',
        company_phone_number: '',
        cadence_id: cadence.cadence_id,
        cadenceStatus: cadence.status,
        leadCadenceOrder: 3,
        // hardcoded as of 11 Aug 2023 since the flow for onboarding is that every company will have sheets integration to start with
        integration_type: LEAD_INTEGRATION_TYPES.ONBOARDING_EXCEL_LEAD,
      },
      {
        sr_no: 4,
        first_name: 'Karina',
        last_name: 'Lopez',
        job_position: 'Customer Support Specialist',
        linkedin_url: 'https://www.linkedin.com/in/karina-lopez-151359281/',
        user_id,
        emails: [{ is_primary: 1, email_id: 'karina.lopez@ringover.com' }],
        phone_numbers: [{ is_primary: 1, phone_number: '+34 919 01 17 02' }],
        company: 'Innoval Corp',
        url: '',
        size: '',
        zip_code: '',
        country: '',
        company_phone_number: '',
        cadence_id: cadence.cadence_id,
        cadenceStatus: cadence.status,
        leadCadenceOrder: 4,
        // hardcoded as of 11 Aug 2023 since the flow for onboarding is that every company will have sheets integration to start with
        integration_type: LEAD_INTEGRATION_TYPES.ONBOARDING_EXCEL_LEAD,
      },
      {
        sr_no: 5,
        first_name: 'David',
        last_name: 'Hernandez',
        job_position: 'Operations Manager',
        linkedin_url: 'https://www.linkedin.com/in/karina-lopez-151359281/',
        user_id,
        emails: [{ is_primary: 1, email_id: 'david.hernandez@ringover.com' }],
        phone_numbers: [{ is_primary: 1, phone_number: '+34 911 98 91 89' }],
        company: 'Mobot Labs',
        url: '',
        size: '',
        zip_code: '',
        country: '',
        company_phone_number: '',
        cadence_id: cadence.cadence_id,
        cadenceStatus: cadence.status,
        leadCadenceOrder: 5,
        // hardcoded as of 11 Aug 2023 since the flow for onboarding is that every company will have sheets integration to start with
        integration_type: LEAD_INTEGRATION_TYPES.ONBOARDING_EXCEL_LEAD,
      },
      {
        sr_no: 6,
        first_name: 'Ashley',
        last_name: 'Liu',
        job_position: 'Team Supervisor',
        linkedin_url: 'https://www.linkedin.com/in/karina-lopez-151359281/',
        user_id,
        emails: [{ is_primary: 1, email_id: 'ashley.liu@ringover.com' }],
        phone_numbers: [{ is_primary: 1, phone_number: '+33 7 45 89 72 10' }],
        company: 'BankPeek',
        url: '',
        size: '',
        zip_code: '',
        country: '',
        company_phone_number: '',
        cadence_id: cadence.cadence_id,
        cadenceStatus: cadence.status,
        leadCadenceOrder: 6,
        // hardcoded as of 11 Aug 2023 since the flow for onboarding is that every company will have sheets integration to start with
        integration_type: LEAD_INTEGRATION_TYPES.ONBOARDING_EXCEL_LEAD,
      },
    ];

    // map through leads and push into leadCreationPromises
    leads.map((lead) =>
      leadCreationPromises.push(
        createLeadForProductTour({ lead, cadence, node, company_id })
      )
    );
    // resolve all promises
    const leadCreationPromisesResolved = await Promise.all(
      leadCreationPromises
    );
    // loop through resolved promises and store the created lead in result if promise was resolved
    for (let leadCreationPromiseResolved of leadCreationPromisesResolved) {
      // destructure data,err
      const [data, err] = leadCreationPromiseResolved;
      if (!err) result.push(data.lead);
    }
    return [result, null];
  } catch (err) {
    logger.error(`Error while creating dummy leads: `, err);
    return [null, err.message];
  }
};

module.exports = createDummyLeads;
