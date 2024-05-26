const { Op } = require('sequelize');
const reel = require('node-reel');
const createCalendarChannel = require('../../../helper/calendar/createNotificationChannel');
const UserRepository = require('../../../repository/user-respository');
const Events = require('./lib/Events');
const UserTokenRepository = require('../../../repository/user-token.repository');

const refreshNotificationChannel = async (tries) => {
  const [userTokens, err] = await UserTokenRepository.getUserTokensByQuery({
    encrypted_google_refresh_token: { [Op.ne]: null },
  });
  if (err) {
    if (tries < 10) {
      refreshNotificationChannel(tries + 1);
    }
  } else {
    for (const userToken of userTokens) {
      await createCalendarChannel(
        userToken?.user_id,
        userToken?.google_refresh_token
      );
    }
  }
};

module.exports = () => {
  reel()
    .call(() => {
      refreshNotificationChannel(0);
    })
    .weekly()
    .mondays()
    .run();
};
