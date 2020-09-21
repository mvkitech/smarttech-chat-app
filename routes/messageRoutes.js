// Required third party packages
const express = require('express');

// Required local packages
const messageController = require('../controllers/messageController');
const isAuth = require('../middleware/is-auth');

// Create the chatroom message routes
const router = express.Router();
router.post(
  '/room/:roomId/messages',
  isAuth,
  messageController.postMessageToChatroom
);

module.exports = router;
