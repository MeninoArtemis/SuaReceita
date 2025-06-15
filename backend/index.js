const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;
console.log('Swagger carregado:', swaggerDocument.info.title); // adicionado para verificar se o Swagger está carregado corretamente

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

document.getElementById('logoutBtn').addEventListener('click', function() {
  window.location.href = "login.html"; // ou o caminho correto do seu login
});
// Update comentário
app.put('/api/comments/:id/:commentIndex', (req, res) => {
  const { id, commentIndex } = req.params;
  const { text } = req.body;

  const comments = readJSON(commentsPath);

  if (!comments[id] || !comments[id][commentIndex]) {
    return res.status(404).json({ message: 'Comentário não encontrado.' });
  }

  comments[id][commentIndex].text = text;
  comments[id][commentIndex].date = new Date().toISOString();

  writeJSON(commentsPath, comments);
  res.json(comments[id][commentIndex]);
});

// Delete comentário
app.delete('/api/comments/:id/:commentIndex', (req, res) => {
  const { id, commentIndex } = req.params;

  const comments = readJSON(commentsPath);

  if (!comments[id] || !comments[id][commentIndex]) {
    return res.status(404).json({ message: 'Comentário não encontrado.' });
  }

  comments[id].splice(commentIndex, 1);
  writeJSON(commentsPath, comments);
  res.json({ message: 'Comentário deletado com sucesso.' });
});
