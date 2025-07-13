const express = require('express');
const authControl = require('../controllers/authController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', authControl.register);
router.post('/login', authControl.login);
router.get('/profile', authenticate, authControl.getProfile);

module.exports = router;