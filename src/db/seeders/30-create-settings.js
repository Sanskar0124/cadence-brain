'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('settings', [
      {
        settings_id: 1,
        user_id: '1',
        automated_task_setting_priority: 3,
        unsubscribe_setting_priority: 3,
        bounced_setting_priority: 3,
        task_setting_priority: 3,
        at_settings_id: 1,
        unsubscribe_settings_id: 1,
        bounced_settings_id: 1,
        task_settings_id: 1,
        skip_setting_priority: 3,
        skip_settings_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        settings_id: 2,
        user_id: 2,
        automated_task_setting_priority: 3,
        unsubscribe_setting_priority: 3,
        bounced_setting_priority: 3,
        task_setting_priority: 3,
        at_settings_id: 1,
        unsubscribe_settings_id: 1,
        bounced_settings_id: 1,
        task_settings_id: 1,
        skip_setting_priority: 3,
        skip_settings_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        settings_id: 3,
        user_id: 3,
        automated_task_setting_priority: 3,
        unsubscribe_setting_priority: 3,
        bounced_setting_priority: 3,
        task_setting_priority: 3,
        at_settings_id: 1,
        unsubscribe_settings_id: 1,
        bounced_settings_id: 1,
        task_settings_id: 1,
        skip_setting_priority: 3,
        skip_settings_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        settings_id: 4,
        user_id: 4,
        automated_task_setting_priority: 3,
        unsubscribe_setting_priority: 3,
        bounced_setting_priority: 3,
        task_setting_priority: 3,
        at_settings_id: 1,
        unsubscribe_settings_id: 1,
        bounced_settings_id: 1,
        task_settings_id: 1,
        skip_setting_priority: 3,
        skip_settings_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        settings_id: 5,
        user_id: 5,
        automated_task_setting_priority: 3,
        unsubscribe_setting_priority: 3,
        bounced_setting_priority: 3,
        task_setting_priority: 3,
        at_settings_id: 1,
        unsubscribe_settings_id: 1,
        bounced_settings_id: 1,
        task_settings_id: 1,
        skip_setting_priority: 3,
        skip_settings_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        settings_id: 6,
        user_id: 6,
        automated_task_setting_priority: 3,
        unsubscribe_setting_priority: 3,
        bounced_setting_priority: 3,
        task_setting_priority: 3,
        at_settings_id: 1,
        unsubscribe_settings_id: 1,
        bounced_settings_id: 1,
        task_settings_id: 1,
        skip_setting_priority: 3,
        skip_settings_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        settings_id: 7,
        user_id: 7,
        automated_task_setting_priority: 3,
        unsubscribe_setting_priority: 3,
        bounced_setting_priority: 3,
        task_setting_priority: 3,
        at_settings_id: 1,
        unsubscribe_settings_id: 1,
        bounced_settings_id: 1,
        task_settings_id: 1,
        skip_setting_priority: 3,
        skip_settings_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        settings_id: 8,
        user_id: 8,
        automated_task_setting_priority: 3,
        unsubscribe_setting_priority: 3,
        bounced_setting_priority: 3,
        task_setting_priority: 3,
        at_settings_id: 1,
        unsubscribe_settings_id: 1,
        bounced_settings_id: 1,
        task_settings_id: 1,
        skip_setting_priority: 3,
        skip_settings_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        settings_id: 9,
        user_id: 9,
        automated_task_setting_priority: 3,
        unsubscribe_setting_priority: 3,
        bounced_setting_priority: 3,
        task_setting_priority: 3,
        at_settings_id: 1,
        unsubscribe_settings_id: 1,
        bounced_settings_id: 1,
        task_settings_id: 1,
        skip_setting_priority: 3,
        skip_settings_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
      {
        settings_id: 10,
        user_id: '7f1ae71c-c48b-4722-9987-25217206d09b',
        automated_task_setting_priority: 3,
        unsubscribe_setting_priority: 3,
        bounced_setting_priority: 3,
        task_setting_priority: 3,
        at_settings_id: 1,
        unsubscribe_settings_id: 1,
        bounced_settings_id: 1,
        task_settings_id: 1,
        skip_setting_priority: 3,
        skip_settings_id: 1,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('settings', null, {});
  },
};
