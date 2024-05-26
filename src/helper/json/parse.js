// Used to parse and stringify a json object (mainly for sequelize)
const parse = (json) => {
  return JSON.parse(JSON.stringify(json));
};

module.exports = parse;
