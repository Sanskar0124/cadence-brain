// Utils
const { JWT_SECRET } = require('./config');

// Packages
const jwt = require('jsonwebtoken');

const generateAccessToken = (
  user_id,
  email,
  first_name,
  role,
  sd_id,
  integration_type
) => {
  return jwt.sign(
    { user_id, email, first_name, role, sd_id, integration_type },
    JWT_SECRET
  );
};

const generateToken = (data) => {
  return jwt.sign(data, JWT_SECRET);
};

const generateExternalAccessToken = (user_id) => {
  return jwt.sign({ user_id }, JWT_SECRET);
};

module.exports = {
  access: {
    generate: generateAccessToken,
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
  },
  generateToken,
};
