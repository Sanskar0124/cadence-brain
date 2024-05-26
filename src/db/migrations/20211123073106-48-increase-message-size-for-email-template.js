'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('email_template', 'body', {
      type: Sequelize.STRING(16383),
      allowNull: false,
      validate: {
        notNull: { msg: 'Email template must have a body' },
        notEmpty: { msg: 'Email template body cannot be empty' },
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('email_template', 'body', {
      type: Sequelize.STRING(5000),
      allowNull: false,
      validate: {
        notNull: { msg: 'Email template must have a body' },
        notEmpty: { msg: 'Email template body cannot be empty' },
      },
    });
  },
};
