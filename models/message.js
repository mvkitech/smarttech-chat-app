const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const messageSchema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sentOn: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Message', messageSchema);
