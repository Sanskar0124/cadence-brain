// Used to check an item is a valid object or not
const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

module.exports = isObject;
