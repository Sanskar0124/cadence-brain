// Used to clean a json object of it's null and undefined values
const clean = (obj) => {
  for (let key in obj) {
    if (obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    }
  }
  return obj;
};

module.exports = clean;
