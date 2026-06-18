// log-output READER (ex 1.05, 1.10): serve the latest line written by the writer
// over HTTP at GET /.  (Part 2 / ex 2.01 extends this to also fetch the ping count.)
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const SHARED_DIR = process.env.SHARED_DIR || '/usr/src/app/files';
const OUTPUT_FILE = path.join(SHARED_DIR, 'output.txt');

app.get('/', (req, res) => {
  let current = 'no output yet';
  try {
    current = fs.readFileSync(OUTPUT_FILE, 'utf8');
  } catch (e) {
    // file not written yet
  }
  res.type('text/plain').send(current);
});

app.listen(PORT, () => console.log(`log-output reader started in port ${PORT}`));
