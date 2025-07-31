const express = require('express');
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const chatController = require('../controllers/chatController');

router.post('/', authenticate, chatController.sendChat);
router.get('/', authenticate, chatController.getChats);

module.exports = router;
