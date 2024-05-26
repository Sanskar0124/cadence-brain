const getDurationInMinutes = (startTime, endTime) => {
  var date1 = new Date(startTime);
  var date2 = new Date(endTime);

  // To calculate the time difference of two dates
  var differenceInTime = date2.getTime() - date1.getTime();

  // To calculate the no. of days between two dates
  var differenceInMinutes = differenceInTime / (1000 * 60);
  return differenceInMinutes;
};

module.exports = getDurationInMinutes;
