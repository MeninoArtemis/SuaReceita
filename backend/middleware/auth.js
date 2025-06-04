const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // Pega token do header Authorization: Bearer TOKEN
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'Nenhum token, autorização negada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;  // { id, username }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido' });
  }
};
