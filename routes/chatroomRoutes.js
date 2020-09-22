// Required third party packages
const express = require('express');
const { body } = require('express-validator');

// Required local packages
const chatroomController = require('../controllers/chatroomController');
const isAuth = require('../middleware/is-auth');
const Room = require('../models/chatroom');

// Create the various chat room routes
const router = express.Router();
router.get('/', chatroomController.getChatrooms);
router.get('/rooms', isAuth, chatroomController.getChatroom);
router.post(
  '/rooms',
  [
    body('name', 'Name must be at least 2 characters and no more than 20.')
      .isString()
      .isLength({ min: 2, max: 20 })
      .trim()
      .custom((value, { req }) => {
        return Room.findOne({ name: value }).then((roomDoc) => {
          if (roomDoc) {
            return Promise.reject(
              'Chatroom exists already, please pick a different name.'
            );
          }
        });
      }),
    body('topic', 'Topic must be at least 3 characters and no more that 30.')
      .isString()
      .isLength({ min: 3, max: 30 })
      .trim(),
  ],
  isAuth,
  chatroomController.postChatroom
);

// Create the chatroom subscribe/unsubscribe routes
router.post(
  '/room/:roomId/subscribe',
  isAuth,
  chatroomController.subscribeUser
);
router.post(
  '/room/:roomId/unsubscribe',
  isAuth,
  chatroomController.unsubscribeUser
);

// Create the enter chatroom route
router.get('/room/:roomId/messages', isAuth, chatroomController.enterChatroom);

module.exports = router;
