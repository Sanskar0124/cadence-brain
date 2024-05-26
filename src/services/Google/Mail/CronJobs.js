// const { Op } = require('sequelize');
// const reel = require('node-reel');
// const UserRepository = require('../../../repository/user-respository');
// const Inbox = require('./lib/Inbox');
// const UserTokenRepository = require('../../../repository/user-token.repository');

// const refreshNotificationChannel = async (tries) => {
//   const [userTokens, err] = await UserTokenRepository.getUserTokensByQuery({
//     encrypted_google_refresh_token: { [Op.ne]: null },
//   });
//   if (err) {
//     if (tries < 10) refreshNotificationChannel(tries + 1);
//   } else {
//     for (const userToken of userTokens)
//       await Inbox.createNotificationChannel({
//         refresh_token: userToken?.google_refresh_token,
//       });
//   }
// };

// module.exports = () => {
//   reel()
//     .call(() => {
//       refreshNotificationChannel(0);
//     })
//     .daily()
//     .run();
// };
