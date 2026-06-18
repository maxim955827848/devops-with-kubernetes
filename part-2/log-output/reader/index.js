// log-output READER (ex 2.01): on GET / serve the latest written line AND the
// current ping count fetched over the internal network from the ping-pong service.
// MESSAGE is injected from a ConfigMap (ex 2.06).
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const SHARED_DIR = process.env.SHARED_DIR || '/usr/src/app/files';
const OUTPUT_FILE = path.join(SHARED_DIR, 'output.txt');
const PINGPONG_URL = process.env.PINGPONG_URL || 'http://ping-pong-svc:2346/pings';
const MESSAGE = process.env.MESSAGE || '';

app.get('/', async (req, res) => {
  let current = 'no output yet';
  try { current = fs.readFileSync(OUTPUT_FILE, 'utf8'); } catch {}

  let pings = 'unavailable';
  try {
    const r = await fetch(PINGPONG_URL);
    pings = await r.text();
  } catch {}

  res.type('text/plain').send(`${MESSAGE}\n${current}.\nPing / Pongs: ${pings}`);
});

app.listen(PORT, () => console.log(`log-output reader started in port ${PORT}`));
