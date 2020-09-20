// Required third party packages
const moment = require('moment');

// Required local packages
const Room = require('../models/chatroom');
const Message = require('../models/message');

/**
 * Invoked when a message is to be posted to specified chatroom.
 */
exports.postMessageToChatroom = (req, res, next) => {
  const roomId = req.params.roomId;
  const content = req.body.content;
  Room.findById(roomId)
    .then((room) => {
      const message = new Message({
        roomId: room,
        userId: req.user,
        username: req.user.username,
        content: content,
        sentOn: formatTimestamp(new Date().getTime()),
      });
      message.save().then((result) => {
        room.addMessage(message);
        Message.find({ roomId: roomId }).then((roomMessages) => {
          res.render('room/chatroom', {
            path: '/room',
            pageTitle: 'Chat Room',
            room: room,
            users: room.getUsersInRoom(),
            messages: roomMessages,
          });
        });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/**
 * Helper function used to format the Date timestamps.
 */
const formatTimestamp = (timestamp) => {
  return `${moment(timestamp).format('YYYY-MM-DD h:mm a')}`;
};
