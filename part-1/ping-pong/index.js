// ping-pong (ex 1.09, 1.11): GET /pingpong increments a counter and replies "pong N".
// The counter is persisted to a file on a PersistentVolume so it survives restarts.
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/usr/src/app/data';
const COUNTER_FILE = path.join(DATA_DIR, 'counter.txt');

fs.mkdirSync(DATA_DIR, { recursive: true });

const readCounter = () => {
  try {
    return parseInt(fs.readFileSync(COUNTER_FILE, 'utf8'), 10) || 0;
  } catch {
    return 0;
  }
};

app.get('/pingpong', (req, res) => {
  const next = readCounter() + 1;
  fs.writeFileSync(COUNTER_FILE, String(next));
  res.type('text/plain').send(`pong ${next}`);
});

// Plain count, used by other services (ex 2.01)
app.get('/pings', (req, res) => {
  res.type('text/plain').send(String(readCounter()));
});

app.listen(PORT, () => console.log(`ping-pong started in port ${PORT}`));
