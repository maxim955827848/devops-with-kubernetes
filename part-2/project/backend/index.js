// Project BACKEND (ex 2.02, 2.08): REST API for todos, stored in PostgreSQL.
// GET /todos -> list ; POST /todos {todo} -> create (validated, max 140 chars)
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;
const pool = new Pool(); // PG* env from Secret

const init = async () => {
  await pool.query('CREATE TABLE IF NOT EXISTS todos (id SERIAL PRIMARY KEY, content TEXT NOT NULL)');
};

app.get('/healthz', (req, res) => res.send('ok'));

app.get('/todos', async (req, res) => {
  const r = await pool.query('SELECT id, content FROM todos ORDER BY id');
  res.json(r.rows);
});

app.post('/todos', async (req, res) => {
  const content = (req.body.todo || '').trim();
  if (!content || content.length > 140) {
    return res.status(400).json({ error: 'todo must be 1-140 characters' });
  }
  const r = await pool.query('INSERT INTO todos (content) VALUES ($1) RETURNING id, content', [content]);
  res.status(201).json(r.rows[0]);
});

init()
  .then(() => app.listen(PORT, () => console.log(`backend started in port ${PORT}`)))
  .catch((e) => { console.error('DB init failed', e); process.exit(1); });
