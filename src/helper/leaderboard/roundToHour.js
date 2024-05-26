function roundToHour(date) {
  let d = new Date(date);
  p = 60 * 60 * 1000; // milliseconds in an hour
  return new Date(Math.round(d.getTime() / p) * p).getTime();
}

module.exports = roundToHour;
