const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../../utils/config');

const jwthelper = {
  generate: (refresh_token) => {
    return jwt.sign({ refresh_token }, JWT_SECRET);
  },
  verify: (accessToken) => {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET);
      return {
        valid: true,
        ...decoded,
      };
    } catch (e) {
      return {
        valid: false,
      };
    }
  },
};

module.exports = jwthelper;
