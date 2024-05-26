const afterCreateLink = require('./afterCreateLink');
const afterUpdateAccount = require('./afterUpdateAccount');
const afterUpdateLead = require('./afterUpdateLead');

const initDBHooks = () => {
  afterCreateLink();
  afterUpdateAccount();
  afterUpdateLead();
};

module.exports = initDBHooks;
