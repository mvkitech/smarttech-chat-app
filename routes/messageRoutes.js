// Required third party packages
const express = require('express');

// Required local packages
const messageController = require('../controllers/messageController');

// Create the chatroom message routes
const router = express.Router();
router.post('/room/:roomId/messages', messageController.postMessageToChatroom);

module.exports = router;
