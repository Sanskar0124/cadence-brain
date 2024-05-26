const dns = require('dns');
const { TRACKING_SERVER_URL } = require('../../utils/config');
const logger = require('../../utils/winston');
//resolve Cname record
const resolveCname = async (domain) => {
  try {
    const addresses = await dns.promises.resolveCname(domain.domain_name);

    if (Array.isArray(addresses))
      if (!addresses.includes(TRACKING_SERVER_URL))
        throw new Error('Ringover CNAME not found in list');
    domain.addresses = addresses;

    return [domain, null];
  } catch (err) {
    logger.error('Error in resolveCname: ', err);
    return [
      null,
      {
        ...domain,
        err: err.message,
      },
    ];
  }
};

module.exports = resolveCname;
