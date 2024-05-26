// Utils
const { DB_TABLES } = require('../../../utils/modelEnums');
const logger = require('../../../utils/winston');
const { TRACKING_SERVER_URL } = require('../../../utils/config');

//Repository
const Repository = require('../../../repository');
const { sequelize } = require('../../../db/models/');

//helpers
const DnsHelper = require('../../dns');

const validateDomains = async () => {
  const t = await sequelize.transaction();

  try {
    //get all custom domains
    let extras = {
      attributes: ['cd_id', 'company_id', 'domain_name', 'domain_status'],
    };
    const [customDomains, errForCustomDomains] = await Repository.fetchAll({
      tableName: DB_TABLES.CUSTOM_DOMAIN,
      extras,
      t,
    });

    if (errForCustomDomains) throw new Error(errForCustomDomains);

    //loop through all custom domains and create DNS promises
    const dnsPromises = customDomains.map(async (customDomain) =>
      DnsHelper.resolveCname(customDomain)
    );
    //wait for all DNS promises to resolve
    let dnsBulkUpdateArray = [];
    for (let [dns, errForDns] of await Promise.all(dnsPromises)) {
      if (errForDns) {
        logger.error(`Error while resolving CNAME `, errForDns);
        if (
          errForDns.err.includes('ENOTFOUND') &&
          errForDns.domain_status === true
        ) {
          delete errForDns.err;
          //domain does not exist
          dnsBulkUpdateArray.push({
            ...errForDns,
            domain_status: false,
          });
        }
      } else {
        const addresses = dns?.addresses;
        let validity = false;
        if (Array.isArray(addresses))
          validity = addresses?.includes(TRACKING_SERVER_URL);
        if (dns.domain_status && !validity)
          dnsBulkUpdateArray.push({
            ...dns,
            domain_status: false,
          });
        else if (!dns.domain_status && validity) {
          dnsBulkUpdateArray.push({
            ...dns,
            domain_status: true,
          });
        }
      }
    }
    //update custom domains with DNS status
    if (dnsBulkUpdateArray.length === 0) {
      logger.info('No custom domains to update');
      t.rollback();
      return;
    }

    let extrasForDomain = { updateOnDuplicate: ['domain_status'] };
    //Update Domains
    const [data, errForCustomDomainUpdate] = await Repository.bulkCreate({
      tableName: DB_TABLES.CUSTOM_DOMAIN,
      createObject: dnsBulkUpdateArray,
      extras: extrasForDomain,
      t,
    });

    if (errForCustomDomainUpdate) {
      throw new Error(errForCustomDomainUpdate);
    }

    logger.info('Custom domains updated');
    t.commit();
  } catch (err) {
    logger.error('An error occurred in validateDomain helper: ', err);
    t.rollback();
  }
};

module.exports = validateDomains;
