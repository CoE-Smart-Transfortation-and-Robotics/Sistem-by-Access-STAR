const express = require('express');
const authControl = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', authControl.register);
router.post('/login', authControl.login);
router.get('/profile', authMiddleware.protect, authControl.getProfile);

module.exports = router;