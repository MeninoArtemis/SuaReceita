const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'seuSegredoSuperSecreto!'; // troque por algo seguro

app.use(cors());
app.use(bodyParser.json());

// Armazenamento em memória (substitua por banco real)
const users = [];
const recipes = [];

// Middleware para proteger rotas
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Rota para cadastro de usuário
app.post('/users/register', async (req, res) => {
  const { username, password } = req.body;

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Usuário já existe' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: 'Usuário criado com sucesso' });
});

// Rota para login
app.post('/users/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Usuário ou senha incorretos' });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ message: 'Usuário ou senha incorretos' });

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// Rota para listar todas receitas (pública)
app.get('/recipes', (req, res) => {
  res.json(recipes);
});

// Rota para criar receita (protegida)
app.post('/recipes', authenticateToken, (req, res) => {
  const { title, description, ingredients, instructions } = req.body;

  if (!title || !description || !ingredients || !instructions) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  const newRecipe = {
    id: recipes.length + 1,
    title,
    description,
    ingredients,
    instructions,
    author: req.user.username,
  };

  recipes.push(newRecipe);
  res.status(201).json(newRecipe);
});

// Rota para editar receita (protegida, só autor pode editar)
app.put('/recipes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, ingredients, instructions } = req.body;

  const recipe = recipes.find(r => r.id === parseInt(id));
  if (!recipe) return res.status(404).json({ message: 'Receita não encontrada' });
  if (recipe.author !== req.user.username) return res.status(403).json({ message: 'Acesso negado' });

  if (title) recipe.title = title;
  if (description) recipe.description = description;
  if (ingredients) recipe.ingredients = ingredients;
  if (instructions) recipe.instructions = instructions;

  res.json(recipe);
});

// Rota para deletar receita (protegida, só autor pode deletar)
app.delete('/recipes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  const recipeIndex = recipes.findIndex(r => r.id === parseInt(id));
  if (recipeIndex === -1) return res.status(404).json({ message: 'Receita não encontrada' });
  if (recipes[recipeIndex].author !== req.user.username) return res.status(403).json({ message: 'Acesso negado' });

  recipes.splice(recipeIndex, 1);
  res.json({ message: 'Receita deletada com sucesso' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
