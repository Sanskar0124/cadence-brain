'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    //tidb doesn't unique:true while adding column - https://github.com/pingcap/tidb/issues/30188
    await queryInterface.addColumn('a_b_testing', 'sms_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addConstraint('a_b_testing', {
      fields: ['sms_id'],
      type: 'unique',
      name: 'sms_id_unique',
    });

    //message_id allowNull:true
    return queryInterface.changeColumn('a_b_testing', 'message_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('a_b_testing', 'sms_id_unique', {
      type: 'unique',
    });
    await queryInterface.removeColumn('a_b_testing', 'sms_id');

    //message_id allowNull:false
    return queryInterface.changeColumn('a_b_testing', 'message_id', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
