const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: {         // ID do usuário que comentou
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {       // nome do usuário (pra exibir sem fazer join depois)
    type: String,
    required: true
  },
  text: {           // texto do comentário
    type: String,
    required: true
  },
  createdAt: {      // data da criação
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', CommentSchema);
