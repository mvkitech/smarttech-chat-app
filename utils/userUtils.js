const users = [];

/**
 * Helper function used to add a user to a chatroom so that
 * they can be tracked in the web sockets used by the UI.
 */
const addUser = ({ id, room, roomname, username }) => {
  const user = { id, room, roomname, username };
  users.push(user);
  return { user };
};

/**
 * Helper function used to remove an existing user from a
 * chat room if they are in the room.
 * Note: id parameter is the Socket ID, not the User ID.
 */
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1);
  }
};

/**
 * Helper function used to remove all users.
 */
const removeAllUsers = () => {
  users.splice(0, users.length);
};

/**
 * Helper function used to return an existing user reference
 * if they already exist in a chat room
 */
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

/**
 * Helper function used to return a collection of users
 * who are already in the specified chat room.
 */
const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  removeAllUsers,
  getUser,
  getUsersInRoom,
};
