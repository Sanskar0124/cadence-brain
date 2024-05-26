const delay = (time) => {
  return new Promise((resolve) => {
    console.log(`Waiting for ${time / 1000} secs...`);
    setTimeout(resolve.bind(null), time);
  });
};

const DelayHelper = {
  delay,
};

module.exports = DelayHelper;
