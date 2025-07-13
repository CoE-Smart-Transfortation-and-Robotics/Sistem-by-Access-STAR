"use strict";
/**
 * Middleware untuk memeriksa role user yang sudah ter-autentikasi
 * @param  {...string} roles - Daftar role yang diizinkan (contoh: 'admin', 'visitor', 'user')
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
};

module.exports = authorizeRole;