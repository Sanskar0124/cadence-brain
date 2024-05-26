const searchUrlParser = (obj) => {
  if (!obj) return [];
  let result = [];
  if (
    typeof obj === 'object' &&
    obj['$type'] === 'com.linkedin.voyager.dash.search.SearchItem'
  ) {
    if (obj.item['*entityResult'])
      result.push(
        obj.item['*entityResult']
          .match(/urn:li:fsd_profile:([^\)]+)/)[1]
          .split(',')[0]
      );
  } else if (typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      const res = searchUrlParser(obj[key]);
      result = [...result, ...res];
    });
  } else if (typeof obj === 'array') {
    for (let ele of obj) {
      const res = searchUrlParser(ele);
      result = [...result, ...res];
    }
  }
  return result;
};
module.exports = searchUrlParser;
