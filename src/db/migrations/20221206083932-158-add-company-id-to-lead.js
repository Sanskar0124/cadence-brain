'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('lead', 'company_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `update crm.lead inner join user on crm.lead.user_id = user.user_id set crm.lead.company_id=user.company_id;`
    );
    // await queryInterface.addConstraint('lead', {
    //   type: 'unique',
    //   name: 'uniqueLeads',
    //   fields: ['integration_id', 'company_id'],
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('lead', 'company_id');
  },
};
