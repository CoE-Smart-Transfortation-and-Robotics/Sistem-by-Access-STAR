const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes (user authentication)
exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: 'Not authorized' });

  const token = authHeader.split(' ')[1];
  console.log('Extracted Token:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    if(!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }
    next();
  } catch (err) {
    console.log('JWT verification error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Authorization (specific roles)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
    }
    next();
  };
};
