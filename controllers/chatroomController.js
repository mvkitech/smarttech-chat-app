// Required third party packages
const { validationResult } = require('express-validator');

// Required local packages
const Room = require('../models/chatroom');
const Message = require('../models/message');

/**
 * Invoked when all chat rooms are to be retrieved.
 * Even though the actual route is "/", it is equivalent
 * to '/rooms' and was only setup like this because of
 * the next route shown which preps UI to create new rooms.
 */
exports.getChatrooms = (req, res, next) => {
  Room.find()
    .then((chatrooms) => {
      res.render('room/index', {
        rooms: chatrooms,
        pageTitle: 'Chat Rooms',
        user: req.user,
        path: '/',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/**
 * Invoked to get new chatroom info ready for the UI view
 * when the user wants to attempt to create a new room.
 */
exports.getChatroom = (req, res, next) => {
  res.render('room/editChatroom', {
    path: '/rooms',
    pageTitle: 'Add Room',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

/**
 * Invoked to post new chatroom create events. If any
 * UI errors exist, user will be redirected back to
 * the "editChatroom" screen. Otherwise a new chatroom
 * is created and the UI is redirected back to '/'.
 */
exports.postChatroom = (req, res, next) => {
  const name = req.body.name;
  const topic = req.body.topic;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('room/editChatroom', {
      path: '/rooms',
      pageTitle: 'Add Room',
      editing: false,
      hasError: true,
      chatroom: {
        name: name,
        topic: topic,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const chatroom = new Room({
    name: name,
    topic: topic,
    createdBy: req.user,
  });
  chatroom
    .save()
    .then((result) => {
      chatroom.addSubscription(req.user);
      res.redirect('/');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/**
 * Invoked to subscribe active user to specified chatroom.
 */
exports.subscribeUser = (req, res, next) => {
  const roomId = req.params.roomId;
  Room.findById(roomId)
    .then((room) => {
      room.addSubscription(req.user);
      res.redirect('/');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/**
 * Invoked to unsubscribe active user from specified chatroom.
 */
exports.unsubscribeUser = (req, res, next) => {
  const roomId = req.params.roomId;
  Room.findById(roomId)
    .then((room) => {
      room.removeSubscription(req.user);
      res.redirect('/');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/**
 * Invoked when the user enters a chatroom
 */
exports.enterChatroom = (req, res, next) => {
  const roomId = req.params.roomId;
  Room.findById(roomId)
    .then((room) => {
      Message.find({ roomId }).then((roomMessages) => {
        res.render('room/chatroom', {
          path: '/room',
          pageTitle: 'Chat Room',
          room: room,
          user: req.user,
        });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
