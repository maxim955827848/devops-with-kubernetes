// The Project (ex 1.02 -> 1.13).
// - serves an HTML page with a cached image (re-downloaded only if older than 24h, ex 1.12)
// - lets the user add Todos via a form, stored in a file on a PersistentVolume (ex 1.13)
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/usr/src/app/data';
const IMAGE_FILE = path.join(DATA_DIR, 'image.jpg');
const TODO_FILE = path.join(DATA_DIR, 'todos.json');
const IMAGE_URL = process.env.IMAGE_URL || 'https://picsum.photos/1200';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

fs.mkdirSync(DATA_DIR, { recursive: true });

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const imageIsFresh = () => {
  try {
    return Date.now() - fs.statSync(IMAGE_FILE).mtimeMs < ONE_DAY_MS;
  } catch {
    return false;
  }
};

const ensureImage = async () => {
  if (imageIsFresh()) return;
  const res = await fetch(IMAGE_URL);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(IMAGE_FILE, buf);
  console.log('cached a new image');
};

const readTodos = () => {
  try {
    return JSON.parse(fs.readFileSync(TODO_FILE, 'utf8'));
  } catch {
    return [];
  }
};
const writeTodos = (todos) => fs.writeFileSync(TODO_FILE, JSON.stringify(todos));

app.get('/image', async (req, res) => {
  try {
    await ensureImage();
    res.sendFile(IMAGE_FILE);
  } catch {
    res.status(502).send('could not fetch image');
  }
});

app.get('/', (req, res) => {
  const items = readTodos().map((t) => `<li>${escapeHtml(t)}</li>`).join('');
  res.send(`<!doctype html>
<html><head><title>The Project</title></head><body>
  <h1>The Project</h1>
  <img src="/image" alt="cached" style="max-width:400px"/>
  <form method="POST" action="/todos">
    <input type="text" name="todo" maxlength="140" placeholder="What needs doing?" />
    <button type="submit">Create TODO</button>
  </form>
  <ul>${items}</ul>
</body></html>`);
});

app.post('/todos', (req, res) => {
  const todo = (req.body.todo || '').trim();
  if (todo) {
    const todos = readTodos();
    todos.push(todo);
    writeTodos(todos);
  }
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Server started in port ${PORT}`));
