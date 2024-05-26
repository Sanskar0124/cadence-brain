// Utils
const logger = require('../../utils/winston');
const { NODE_TYPES, NODE_DATA } = require('../../utils/enums');

const isValidNode = (node) => {
  try {
    /**
     * * Find key in NODE_TYPES having value if node.type
     * * If key not found, return
     * * If key found, validate if node.data has valid fields
     */

    // * find key in NODE_TYPES having value of node.type
    let type = Object.keys(NODE_TYPES).find(
      (type) => NODE_TYPES[type] === node.type
    );

    // * If type not found,node type is not valid
    if (!type) return [null, 'Provide a valid node type.'];

    if (node.type === NODE_TYPES.AUTOMATED_MAIL) {
      for (let key of Object.keys(NODE_DATA[type])) {
        // * if key not present in node.data, return
        if (node?.data[key] === undefined)
          return [null, 'All required fields in data are not specified.'];
      }

      if (node?.data?.aBTestEnabled === true) {
        if (node?.data?.templates.length < 2)
          return [null, `Templates array should have minimum 2 templates`];

        if (node?.data?.templates.length > 4)
          return [null, `Templates array should have maximum 4 templates`];

        let percentage = 0;

        for (let template of node.data.templates) {
          if (template.percentage === undefined)
            return [null, `Percentage for template not defined`];

          percentage += template.percentage;
        }
        if (percentage !== 100) return [null, `Addition of percentage not 100`];
      }
    } else if (node.type === NODE_TYPES.MAIL) {
      for (let key of Object.keys(NODE_DATA[type])) {
        // * if key not present in node.data, return
        if (node?.data[key] === undefined)
          return [null, 'All required fields in data are not specified.'];
      }

      if (node?.data?.aBTestEnabled === true) {
        if (node?.data?.templates.length < 2)
          return [null, `Templates array should have minimum 2 templates`];

        if (node?.data?.templates.length > 4)
          return [null, `Templates array should have maximum 4 templates`];

        let percentage = 0;

        for (let template of node.data.templates) {
          if (template.percentage === undefined)
            return [null, `Percentage for template not defined`];

          percentage += template.percentage;
        }
        if (percentage !== 100) return [null, `Addition of percentage not 100`];
      }
    } else if (
      [
        NODE_TYPES.LINKEDIN_CONNECTION,
        NODE_TYPES.LINKEDIN_MESSAGE,
        NODE_TYPES.LINKEDIN_PROFILE,
        NODE_TYPES.LINKEDIN_INTERACT,
        NODE_TYPES.AUTOMATED_LINKEDIN_CONNECTION,
        NODE_TYPES.AUTOMATED_LINKEDIN_MESSAGE,
        NODE_TYPES.AUTOMATED_LINKEDIN_PROFILE,
      ].includes(node.type)
    ) {
      for (let key of Object.keys(NODE_DATA[type])) {
        if (node?.data[key] === undefined)
          return [null, 'All required fields in data are not specified.'];
      }
    } else if (
      node.type === NODE_TYPES.REPLY_TO ||
      node.type === NODE_TYPES.AUTOMATED_REPLY_TO
    ) {
      for (let key of Object.keys(NODE_DATA[type])) {
        // * if key not present in node.data, return
        if (node?.data[key] === undefined)
          return [null, 'All required fields in data are not specified.'];
      }

      if (node?.data?.aBTestEnabled === true) {
        if (node?.data?.templates.length < 2)
          return [null, `Templates array should have minimum 2 templates`];

        if (node?.data?.templates.length > 4)
          return [null, `Templates array should have maximum 4 templates`];

        let percentage = 0;

        for (let template of node.data.templates) {
          if (template.percentage === undefined)
            return [null, `Percentage for template not defined`];

          percentage += template.percentage;
        }
        if (percentage !== 100) return [null, `Addition of percentage not 100`];
      }
    } else {
      for (let key of Object.keys(NODE_DATA[type])) {
        // * if key not present in node.data, return
        if (node?.data[key] === undefined)
          return [null, 'All required fields in data are not specified.'];
      }
    }

    return [true, null];
  } catch (err) {
    logger.error(`Error while validating node: `, err);
    return [null, err.message];
  }
};

module.exports = isValidNode;
