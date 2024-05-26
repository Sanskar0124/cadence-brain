const generateTrackingId = () => {
  random_int_arr = [];
  for (let i = 0; i < 16; i++) {
    random_int_arr.push(Math.ceil(Math.random() * 256));
  }
  byte_arr = Buffer.from(random_int_arr);
  return byte_arr.toString('base64');
};

module.exports = generateTrackingId;
