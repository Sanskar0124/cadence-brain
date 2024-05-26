'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Sub_Department extends Model {
    static associate({
      User,
      Department,
      Message_Template,
      Email_Template,
      Script_Template,
      Linkedin_Template,
      Whatsapp_Template,
      Cadence,
      Sub_Department_Settings,
      Unsubscribe_Mail_Settings,
      Bounced_Mail_Settings,
      Lead_Score_Settings,
    }) {
      this.hasMany(User, { foreignKey: 'sd_id' });
      this.belongsTo(Department, { foreignKey: 'department_id' });
      this.hasMany(Message_Template, { foreignKey: 'sd_id' });
      this.hasMany(Email_Template, { foreignKey: 'sd_id' });
      this.hasMany(Script_Template, { foreignKey: 'sd_id' });
      this.hasMany(Linkedin_Template, { foreignKey: 'sd_id' });
      this.hasMany(Whatsapp_Template, { foreignKey: 'sd_id' });
      this.hasMany(Cadence, { foreignKey: 'sd_id' });
      this.hasOne(Sub_Department_Settings, { foreignKey: 'sd_id' });
      this.hasMany(Unsubscribe_Mail_Settings, { foreignKey: 'sd_id' });
      this.hasMany(Bounced_Mail_Settings, { foreignKey: 'sd_id' });
      this.hasOne(Lead_Score_Settings, { foreignKey: 'sd_id' });
    }
  }
  Sub_Department.init(
    {
      sd_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      profile_picture: {
        type: Sequelize.VIRTUAL,
        get() {
          return `https://storage.googleapis.com/apt-cubist-307713.appspot.com/crm/sub-department-images/${this.sd_id}`;
        },
        set(value) {
          throw new Error('Do not try to set the `profile_picture` value!');
        },
      },
      is_profile_picture_present: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      department_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'sub_department',
      modelName: 'Sub_Department',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Sub_Department;
};
