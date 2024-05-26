'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert('salesforce_tokens', [
      {
        user_id: '2',
        encrypted_access_token:
          'ca0400cc117947715c9a6acf94fcbbdec8e3fc84b555eb1e361f79604ebf7b2700f52e3652d8ec34109643ba57b689cf999f6d47195c9c929368dea8938ffd832039616576727979214e06d54b63d22dd720d4f69c95140fd4e135f13b07c0b9081d4c922ce2acaaad30bfce3cf25aa2',
        encrypted_refresh_token:
          'cf7521894e7f460f2be944c69afde485e080d8f587588f261c274e5859906e4865f9182253fefc022c8f278a6ecc9cecb6cb74360b5f84feb757e0e8a98eac9a1b50734f7f50727c12774fca586ac91ed82ef4eba99816',
        encrypted_instance_url:
          '924030890573586e15df5acbbef5f68ca4d5ccb3c977bd6301240f4755907b6234e01f1e47bbf70b32',
        is_logged_out: 0,
        created_at: '2021-06-08T20:00:000',
        updated_at: '2021-06-08T20:00:000',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('salesforce_tokens', null, {});
  },
};
