const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/auth');

// Criar comentário (rota protegida)
router.post('/', authMiddleware, async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;
  const username = req.user.username;

  if (!text) {
    return res.status(400).json({ msg: 'Texto do comentário é obrigatório' });
  }

  try {
    const newComment = new Comment({
      userId,
      username,
      text
    });

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Listar comentários
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
