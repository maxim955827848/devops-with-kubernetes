// log-output WRITER (ex 1.10): generate a random string once, then append a
// "<timestamp>: <string>" line to a shared file every 5 seconds.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SHARED_DIR = process.env.SHARED_DIR || '/usr/src/app/files';
const OUTPUT_FILE = path.join(SHARED_DIR, 'output.txt');

const randomString = crypto.randomUUID();

fs.mkdirSync(SHARED_DIR, { recursive: true });

const write = () => {
  const line = `${new Date().toISOString()}: ${randomString}`;
  fs.writeFileSync(OUTPUT_FILE, line);
  console.log(`wrote: ${line}`);
};

write();
setInterval(write, 5000);
