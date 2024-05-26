const HTMLParser = require('node-html-parser');
const logger = require('../../../../utils/winston');

const resizeImage = (body) => {
  try {
    let html = HTMLParser.parse(body);
    let figures = html.querySelectorAll('figure');
    let inlineSpans = html.querySelectorAll('span.image-inline');
    let videoDivs = html.querySelectorAll('div.video-tracking-img');

    figures.forEach((figure) => {
      let imageTag = figure.getElementsByTagName('img');
      imageTag = imageTag[0];
      if (imageTag) {
        imageTag.setAttribute('style', figure.attrs.style);
        if (!figure.attrs.style)
          imageTag.setAttribute('style', 'width:100.00%');
      }
      figure.setAttribute('style', 'margin:0;');
    });

    inlineSpans.forEach((span) => {
      let imageTag = inlineSpans.getElementsByTagName('img');
      imageTag = imageTag[0];
      if (imageTag) {
        imageTag.setAttribute('style', span.attrs.style);
        if (!span.attrs.style) imageTag.setAttribute('style', 'width:100.00%');
      }
    });

    let imageTags = html.querySelectorAll('div.video-tracking-img > a > img');

    imageTags.forEach((imageTag) => {
      imageTag.setAttribute('style', 'width:100%; display:inline-block;');
    });

    return [html.toString(), null];
  } catch (err) {
    logger.error(`Error while resizing image from figure`, err);
    return [null, err.message];
  }
};

module.exports = resizeImage;
