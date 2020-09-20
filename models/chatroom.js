const mongoose = require('mongoose');

// Used only by the UI to control who is
// actively in a chat room at any moment.
const usersInRoom = [];

const Schema = mongoose.Schema;
const chatroomSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscribers: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    },
  ],
  messages: [
    {
      messageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        required: true,
      },
    },
  ],
});

/**
 * Used to determine if user is or is not a subscriber to this chatroom.
 */
chatroomSchema.methods.isUserSubscribed = function (user) {
  return this.subscribers.find(
    (subscriber) => subscriber.userId.toString() === user._id.toString()
  );
};

/**
 * Used to add the user as a subscriber to this chatroom.
 */
chatroomSchema.methods.addSubscription = async function (user) {
  this.subscribers = [...this.subscribers, { userId: user }];
  return await this.save();
};

/**
 * Used to remove the user as a subscriber to this chatroom.
 */
chatroomSchema.methods.removeSubscription = async function (user) {
  const updatedSubscriptions = this.subscribers.filter((subscriber) => {
    return subscriber.userId.toString() !== user._id.toString();
  });
  this.subscribers = updatedSubscriptions;
  return await this.save();
};

/**
 * Used to return collection of users who are actively in room.
 */
chatroomSchema.methods.getUsersInRoom = function () {
  return usersInRoom;
};

/**
 * Used add the specified user to the collection of users who may
 * be actively inside the chatroom at this time.
 */
chatroomSchema.methods.addUserToRoom = function (user) {
  usersInRoom.push(user);
};

/**
 * Used add the specified user to the collection of users who may
 * be actively inside the chatroom at this time.
 */
chatroomSchema.methods.removeUserFromRoom = function (user) {
  const index = usersInRoom.findIndex((target) => {
    return target._id.toString() === user._id.toString();
  });
  if (index > -1) {
    usersInRoom.splice(index, 1);
  }
};

/**
 * Used to add a new message to this chatroom.
 */
chatroomSchema.methods.addMessage = async function (message) {
  this.messages = [...this.messages, { messageId: message }];
  return await this.save();
};

module.exports = mongoose.model('Chatroom', chatroomSchema);
