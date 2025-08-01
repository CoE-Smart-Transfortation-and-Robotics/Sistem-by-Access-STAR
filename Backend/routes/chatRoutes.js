const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');
const chatController = require('../controllers/chatController');

router.post('/', authenticate, chatController.sendChat);
router.get('/', authenticate, chatController.getChats);
router.get('/urgent', authenticate, authorizeRole('admin'), chatController.getUrgentChats);

module.exports = router;