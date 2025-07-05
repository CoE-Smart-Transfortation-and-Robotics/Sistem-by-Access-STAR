const jwt = require('jsonwebtoken');
const { User } = require('../models');
const SECRET_KEY = process.env.JWT_SECRET || 'secret123';

/**
 * Middleware untuk memverifikasi token JWT dan menyimpan user lengkap ke req.user
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Malformed or missing token' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'phone', 'nik', 'address', 'role']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;