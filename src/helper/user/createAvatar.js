//Utils
const logger = require('../../utils/winston');
const { DARK_AVATAR_BACKGROUND_COLORS } = require('../../utils/enums');

//Packages
const crypto = require('crypto');
const { createHash } = crypto;
//const svg2img = require('svg2img');
//const sharp = require("sharp")

//Services
const Storage = require('../../services/Google/Storage');

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const createAvatar = async ({ user_id, first_name, last_name }) => {
  try {
    const name = `${first_name} ${last_name}`;
    // const width = 150;
    // const height = 140;
    // const bgColor = AVATAR_BACKGROUND_COLORS[randomIntFromInterval(0, 11)];
    // const buf = await createInitialsImage(name, width, height, bgColor);
    const bgObject = DARK_AVATAR_BACKGROUND_COLORS[randomIntFromInterval(0, 6)];
    const initials = getInitials(name);
    const [buf, errForBuf] = await generateProfilePicture(initials, bgObject);
    if (errForBuf) {
      logger.error('Error generation buffer:', errForBuf);
      return [null, 'Error generation buffer'];
    }
    const [url, errForUrl] = await Storage.Bucket.uploadSvg(buf, user_id);
    if (errForUrl) {
      logger.error('Error while storing buffer in storage:', errForUrl);
      return [null, 'Error while storing buffer in storage'];
    }

    return [url, null];
  } catch (err) {
    logger.error('Error while creating Avatar:', err);
    return [null, err.message];
  }
};

function getInitials(name) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('');
  return initials.toUpperCase();
}

const generateProfilePicture = async (initials, bgColor) => {
  try {
    const size = 100;
    var hash = createHash('md5')
      .update(initials + size)
      .digest('hex');

    let svg =
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"  width="' +
      size +
      '" height="' +
      size +
      '">';

    svg += '<defs>';
    svg +=
      '<linearGradient id="grad-' +
      hash +
      '" x1="0%" y1="0%" x2="100%" y2="100%">';
    svg += `<stop offset="0%" style="stop-color:${bgColor.one};stop-opacity:1" />`;
    svg += `<stop offset="100%" style="stop-color:${bgColor.zero};stop-opacity:1" />`;
    svg += '</linearGradient>';
    svg += '</defs>';
    svg +=
      '<rect x="0" y="0" width="' +
      size +
      '" height="' +
      size +
      '" fill="url(#grad-' +
      hash +
      ')" />';

    svg +=
      '<text x="' +
      50 +
      '" y="' +
      55 +
      '" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size = "40px" text-anchor="middle" alignment-baseline="middle">' +
      initials +
      '</text>';

    svg += '</svg>';
    return [svg, null];
  } catch (err) {
    logger.error('error while generating profile picture', err);
    return [null, err];
  }
};

module.exports = createAvatar;

// createAvatar({
//   user_id : "b25a2770-80a1-4595-929b-06c361c2752c",
//   first_name : "test",
//   last_name : "name"
// })
