// Project BACKEND (ex 2.02, 2.08): REST API for todos, stored in PostgreSQL.
// GET /todos -> list ; POST /todos {todo} -> create (validated, max 140 chars)
// ex 4.03 / 4.05: exposes Prometheus metrics at /metrics.
// ex 4.06: when NATS_URL is set, publish a "todos.created" event so the
// broadcaster (and any other consumer) can react. Best-effort: if the broker
// is down or unset, todo creation still succeeds.
const express = require('express');
const { Pool } = require('pg');
const { connect, StringCodec } = require('nats');
const client = require('prom-client');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;
const pool = new Pool(); // PG* env from Secret

// ex 4.03 / 4.05 — Prometheus metrics. The `app` label lets the Argo Rollouts
// analysis (analysis-template.yaml) query http_requests_total{app="project-backend"}.
client.register.setDefaultLabels({ app: 'project-backend' });
client.collectDefaultMetrics();
const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequests.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode,
    });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

const NATS_URL = process.env.NATS_URL;
const SUBJECT = process.env.NATS_SUBJECT || 'todos.created';
const sc = StringCodec();
let nats = null;

const connectNats = async () => {
  if (!NATS_URL) return;
  try {
    nats = await connect({ servers: NATS_URL });
    console.log(`connected to NATS at ${NATS_URL}`);
  } catch (e) {
    console.error('NATS connect failed (continuing without it)', e.message);
  }
};

const publishCreated = (content) => {
  if (!nats) return;
  try {
    nats.publish(SUBJECT, sc.encode(content));
  } catch (e) {
    console.error('NATS publish failed', e.message);
  }
};

const init = async () => {
  await pool.query('CREATE TABLE IF NOT EXISTS todos (id SERIAL PRIMARY KEY, content TEXT NOT NULL)');
  await connectNats();
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
  publishCreated(content);
  res.status(201).json(r.rows[0]);
});

init()
  .then(() => app.listen(PORT, () => console.log(`backend started in port ${PORT}`)))
  .catch((e) => { console.error('DB init failed', e); process.exit(1); });
