// log-output WRITER: append "<timestamp>: <uuid>" to a shared file every 5s.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SHARED_DIR = process.env.SHARED_DIR || '/usr/src/app/files';
const OUTPUT_FILE = path.join(SHARED_DIR, 'output.txt');
const randomString = crypto.randomUUID();

fs.mkdirSync(SHARED_DIR, { recursive: true });

const write = () => {
  fs.writeFileSync(OUTPUT_FILE, `${new Date().toISOString()}: ${randomString}`);
};
write();
setInterval(write, 5000);
