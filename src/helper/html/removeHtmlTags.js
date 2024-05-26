const removeHtmlTags = (str) => {
  if (str === null || str === '') return [null, `Not a valid string.`];
  else str = str.toString();
  return [str.replace(/(<([^>]+)>)/gi, ''), null];
};

module.exports = removeHtmlTags;
