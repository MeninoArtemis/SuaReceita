const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/suareceita', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar no MongoDB:', error.message);
    process.exit(1); // Sai da aplicação em caso de erro
  }
};

module.exports = connectDB;
