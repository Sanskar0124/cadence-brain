const getEntity = (name, addr) => {
  if (!addr) throw new Error('Address not present');

  if (!name) return addr;

  return `${name} <${addr}>`;
};

module.exports = getEntity;
