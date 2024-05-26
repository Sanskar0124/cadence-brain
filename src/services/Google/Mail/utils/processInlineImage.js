// Utils
const logger = require('../../../../utils/winston');

// Packages
const crypto = require('crypto');
const { MAIL_INTEGRATION_TYPES } = require('../../../../utils/enums');

const processInlineImage = (body, attachments, integrationType) => {
  try {
    switch (integrationType) {
      case MAIL_INTEGRATION_TYPES.GOOGLE:
        if (!body) return [{ body, attachments }, null];

        let attachmentsObject = {};

        function getCid(mimeType, base64) {
          if (attachmentsObject[base64]) return attachmentsObject[base64].cid;

          var randomCid = '' + crypto.randomBytes(8).toString('hex');

          attachmentsObject[base64] = {
            contentType: mimeType,
            cid: randomCid,
            content: base64,
            encoding: 'base64',
            contentDisposition: 'inline',
          };
          return randomCid;
        }

        // replace html based images
        body = body.replace(
          /(<img[\s\S]*? src=['"])data:(image\/(?:png|jpe?g|gif));base64,([\s\S]*?)(['"][\s\S]*?>)/g,
          function (g, start, mimeType, base64, end) {
            return start + 'cid:' + getCid(mimeType, base64) + end;
          }
        );

        // Replace css based images
        body = body.replace(
          /(url\(\s*('|"|&quot;|&QUOT;|&apos;|&#3[49];|&#[xX]2[27];)?)data:(image\/(?:png|jpe?g|gif));base64,([\s\S]*?)(\2\s*\))/g,
          function (g, start, quot, mimeType, base64, end) {
            return start + 'cid:' + getCid(mimeType, base64) + end;
          }
        );

        if (!attachments) attachments = [];

        Object.keys(attachmentsObject).forEach(function (cid) {
          attachments.push(attachmentsObject[cid]);
        });
        break;
      case MAIL_INTEGRATION_TYPES.OUTLOOK:
        //TBD
        break;
    }

    return [{ body, attachments }, null];
  } catch (err) {
    logger.error(`Error while resizing image from figure: `, err);
    return [{ body, attachments }, err.message];
  }
};

module.exports = processInlineImage;
