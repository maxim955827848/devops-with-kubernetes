// ping-pong (ex 2.07): counter stored in PostgreSQL instead of a file.
// DB credentials come from a Kubernetes Secret (PG* env vars).
// A demo SECRET_TOKEN (ex 2.05) is also injected from a Secret.
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_TOKEN = process.env.SECRET_TOKEN || '(none)';

const pool = new Pool(); // reads PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT

const init = async () => {
  await pool.query('CREATE TABLE IF NOT EXISTS pingpong (id INT PRIMARY KEY, count INT NOT NULL)');
  await pool.query('INSERT INTO pingpong (id, count) VALUES (1, 0) ON CONFLICT (id) DO NOTHING');
};

app.get('/pingpong', async (req, res) => {
  const r = await pool.query('UPDATE pingpong SET count = count + 1 WHERE id = 1 RETURNING count');
  res.type('text/plain').send(`pong ${r.rows[0].count}`);
});

app.get('/pings', async (req, res) => {
  const r = await pool.query('SELECT count FROM pingpong WHERE id = 1');
  res.type('text/plain').send(String(r.rows[0]?.count ?? 0));
});

init()
  .then(() => app.listen(PORT, () => console.log(`ping-pong started in port ${PORT} (secret token loaded: ${SECRET_TOKEN !== '(none)'})`)))
  .catch((e) => { console.error('DB init failed', e); process.exit(1); });
