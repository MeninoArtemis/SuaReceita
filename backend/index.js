const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const usuariosPath = path.join(__dirname, 'usuarios.json');
const commentsPath = path.join(__dirname, 'comments.json');

// Initialize JSON files if not exist
if (!fs.existsSync(usuariosPath)) fs.writeFileSync(usuariosPath, JSON.stringify([], null, 2));
if (!fs.existsSync(commentsPath)) fs.writeFileSync(commentsPath, JSON.stringify({}, null, 2));

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Register
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(usuariosPath);
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Usuário já existe.' });
  }
  users.push({ username, password });
  writeJSON(usuariosPath, users);
  res.status(201).json({ message: 'Cadastro realizado.' });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(usuariosPath);
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
  }
  res.json({ message: 'Login bem-sucedido.' });
});

// Get comments for a recipe
app.get('/api/comments/:id', (req, res) => {
  const comments = readJSON(commentsPath);
  const recipeComments = comments[req.params.id] || [];
  res.json(recipeComments);
});

// Post a comment
app.post('/api/comments/:id', (req, res) => {
  const { username, text } = req.body;
  const comments = readJSON(commentsPath);
  const newComment = { username, text, date: new Date().toISOString() };
  if (!comments[req.params.id]) comments[req.params.id] = [];
  comments[req.params.id].push(newComment);
  writeJSON(commentsPath, comments);
  res.status(201).json(newComment);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});