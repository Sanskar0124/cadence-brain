const DOMParser = require('xmldom').DOMParser;

const extractHTMLContent = (htmlText) => {
  var doc = new DOMParser().parseFromString(htmlText, 'text/xml');
  console.log('doc: ', doc);
  console.log('content: ', doc.documentElement.textContent);
  return doc.documentElement.textContent;
};

module.exports = extractHTMLContent;
