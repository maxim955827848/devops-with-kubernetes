// Project FRONTEND (ex 2.02): serves the UI and talks to the backend Service.
// GET /  -> fetch todos from backend and render the page
// POST /todos -> forward the new todo to the backend, then redirect
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://project-backend-svc:3001';

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

app.get('/healthz', (req, res) => res.send('ok'));

app.get('/', async (req, res) => {
  let todos = [];
  try {
    todos = await (await fetch(`${BACKEND_URL}/todos`)).json();
  } catch {}
  const items = todos.map((t) => `<li>${escapeHtml(t.content)}</li>`).join('');
  res.send(`<!doctype html>
<html><head><title>The Project</title></head><body>
  <h1>The Project — Todos</h1>
  <form method="POST" action="/todos">
    <input type="text" name="todo" maxlength="140" placeholder="What needs doing?" />
    <button type="submit">Create TODO</button>
  </form>
  <ul>${items}</ul>
</body></html>`);
});

app.post('/todos', async (req, res) => {
  const todo = (req.body.todo || '').trim();
  if (todo) {
    try {
      await fetch(`${BACKEND_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todo }),
      });
    } catch {}
  }
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Server started in port ${PORT}`));
