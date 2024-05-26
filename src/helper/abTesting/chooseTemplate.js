// Utils
const Repository = require('../../repository');
const { DB_TABLES } = require('../../utils/modelEnums');
const logger = require('../../utils/winston');

// Helpers
const getRandomInteger = require('./../random/getRandomInteger');

/**
 * @param {Array} templates
 * @returns {Object} - Chosen template.
 */
const chooseTemplate = async (templates) => {
  try {
    let promises = [];

    //retreive count of all sent abtemplates

    templates.forEach((template) => {
      promises.push(
        Repository.count({
          tableName: DB_TABLES.A_B_TESTING,
          query: { ab_template_id: template.ab_template_id },
        })
      );
    });
    let counts = await Promise.all(promises);

    let totalSent = 0;
    counts.forEach(([count, err], index) => {
      if (err) return [null, err];
      templates[index].sent = count;
      totalSent += count;
    });

    if (totalSent > 0) {
      // calculate current percentage of each template and if less than expected then send that template
      let length = templates.length;
      let i = 0;
      while (i < length) {
        let percentage = (templates[i].sent / totalSent) * 100;
        if (percentage < templates[i].percentage) {
          return [templates[i], null];
        }
        i++;
      }
    }

    // code reaches here in 2 cases
    // 1) if none of the templates have been sent
    // 2) if all templates satisfy the current % then send any random template
    let randomInteger = getRandomInteger(0, templates.length - 1);
    return [templates[randomInteger], null];
  } catch (err) {
    logger.error(`Error while trying to create an ab testing entry: `, err);
    return [null, err.message];
  }
};

module.exports = chooseTemplate;
