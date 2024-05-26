const formatTasksToIntervals = (tasks, timeZone = null, heatMap) => {
  // changine complete_time of current task to the user specific timezone

  for (let task of tasks) {
    const timeZonedDate = new Date(
      new Date(new Date(task.complete_time)).toLocaleString('en-US', {
        timeZone: timeZone || 'Asia/Kolkata',
      })
    );

    let dayOfWeek = timeZonedDate.getDay();
    let hourOfDay = timeZonedDate.getHours();

    dayOfWeek = (dayOfWeek + 6) % 7;

    heatMap[dayOfWeek][hourOfDay].push(task);
  }

  return heatMap;
};

module.exports = formatTasksToIntervals;
