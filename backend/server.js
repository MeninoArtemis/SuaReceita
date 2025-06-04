const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/comments', require('./routes/comments'));

// Rotas
app.use('/api/auth', require('./routes/auth'));

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB conectado');
  app.listen(5000, () => console.log('Servidor rodando na porta 5000'));
})
.catch(err => console.error('Erro ao conectar MongoDB:', err));

