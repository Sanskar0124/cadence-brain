'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('cadence', 'field_map', {
      type: Sequelize.JSON,
      after: 'salesforce_cadence_id',
    });

    await queryInterface.sequelize.query(
      `update cadence set field_map='{"emails":["Work Email","Home Email","Other Email"],"first_name":"First Name","job_position":"Job Position","last_name":"Last Name","full_name":"Full Name","linkedin_url":"Linkedin URL","phone_numbers":["Work Phone","Home Phone","Other Phone"],"source_site":"Source Site","lead_id":"Lead ID","integration_id":"Integration ID","type":"Type","status":"Status","primary_email":"Primary Email","primary_phone":"Primary Phone","owner_integration_id":"User GSheets ID","company":"Company","size":"Size","url":"Company Website","country":"Country","zip_code":"Zip","comment":"Comment","company_phone_number":"Company Phone"}';`
    );
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('cadence', 'field_map');
  },
};
