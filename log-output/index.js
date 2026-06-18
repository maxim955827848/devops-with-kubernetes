// Exercise 1.1 "Log output"
// On startup, generate a random string, then print it with an ISO timestamp every 5 seconds.
const crypto = require('crypto');

const randomString = crypto.randomUUID();

const logOnce = () => {
  console.log(`${new Date().toISOString()}: ${randomString}`);
};

logOnce();
setInterval(logOnce, 5000);
