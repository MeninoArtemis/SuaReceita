// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let users = [];
let comments = {}; // chave: recipeId, valor: array de comentários

// Rota de cadastro
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Campos obrigatórios' });

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Usuário já existe' });
  }

  users.push({ username, password });
  res.json({ message: 'Usuário criado com sucesso' });
});

// Rota de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Usuário ou senha incorretos' });
  res.json({ message: 'Login bem-sucedido' });
});

// Buscar comentários de uma receita
app.get('/api/comments/:recipeId', (req, res) => {
  const { recipeId } = req.params;
  res.json(comments[recipeId] || []);
});

// Adicionar comentário a uma receita
app.post('/api/comments/:recipeId', (req, res) => {
  const { recipeId } = req.params;
  const { username, text } = req.body;

  if (!username || !text) return res.status(400).json({ message: 'Campos obrigatórios' });

  if (!comments[recipeId]) comments[recipeId] = [];

  comments[recipeId].push({ username, text, date: new Date().toISOString() });

  res.json({ message: 'Comentário adicionado' });
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});