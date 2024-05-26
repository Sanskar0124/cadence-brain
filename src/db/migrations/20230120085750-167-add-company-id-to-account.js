'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('account', 'company_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `update account inner join user on account.user_id = user.user_id set account.company_id=user.company_id;`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('account', 'company_id');
  },
};
