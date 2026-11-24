// server.js - Task Manager REST API (in-memory storage)
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5002;

// Fix 1 & 2: Allow frontend origin and all standard HTTP methods (GET, POST, PUT, DELETE)
app.use(cors());

// Fix 3: Parse JSON request bodies
app.use(express.json());

// ---------- In-memory "database" ----------
let tasks = [
  { id: 1, title: 'Read the Express routing docs', done: true, createdAt: '2026-09-20T08:00:00.000Z' },
  { id: 2, title: 'Install Postman', done: false, createdAt: '2026-09-21T09:30:00.000Z' },
  { id: 3, title: 'Finish Lab 4 exercise 3', done: false, createdAt: '2026-09-22T14:15:00.000Z' },
  { id: 4, title: 'Review HTTP status codes', done: false, createdAt: '2026-09-23T10:45:00.000Z' }
];
let nextId = 5;

// Fix 4: Return "title" instead of "name" to match API contract
const toDto = (task) => ({
  id: task.id,
  title: task.title,
  done: task.done,
  createdAt: task.createdAt
});

// ---------- Routes ----------

// GET /api/tasks?status=all|active|done
app.get('/api/tasks', (req, res) => {
  const { status } = req.query;

  if (status === 'active') {
    return res.json({ success: true, data: tasks.filter((t) => !t.done).map(toDto) });
  }

  // Fix 5: Send JSON response for status=done instead of leaving the request pending
  if (status === 'done') {
    const doneTasks = tasks.filter((t) => t.done);
    console.log(`Found ${doneTasks.length} completed task(s)`);
    return res.json({ success: true, data: doneTasks.map(toDto) });
  }

  return res.json({ success: true, data: tasks.map(toDto) });
});

// GET /api/tasks/stats
app.get('/api/tasks/stats', (req, res) => {
  const total = tasks.length;
  // Fix 6: Count done with t.done and active with !t.done
  const done = tasks.filter((t) => t.done).length;
  const active = tasks.filter((t) => !t.done).length;
  res.json({ success: true, data: { total, active, done } });
});

// POST /api/tasks  body: { title }
app.post('/api/tasks', (req, res) => {
  const { title } = req.body || {};

  // Fix 7: Return immediately on 400 so no blank task is created
  if (!title || !String(title).trim()) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const task = {
    id: nextId++,
    title: String(title).trim(),
    done: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  res.status(201).json({ success: true, data: toDto(task) });
});

// PUT /api/tasks/:id  body: { title?, done? }
app.put('/api/tasks/:id', (req, res) => {
  // Fix 8: Parse req.params.id to number before strict comparison
  const id = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  if (req.body.title !== undefined) {
    if (!String(req.body.title).trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    task.title = String(req.body.title).trim();
  }

  // Fix 9: Allow false to overwrite true by checking for undefined instead of using ||
  if (req.body.done !== undefined) {
    task.done = Boolean(req.body.done);
  }

  res.json({ success: true, data: toDto(task) });
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  // Fix 10: Find array index and splice at index instead of id
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  tasks.splice(index, 1);
  res.json({ success: true, message: 'Task deleted' });
});

app.listen(PORT, () => {
  console.log(`Task API running at http://localhost:${PORT}`);
});