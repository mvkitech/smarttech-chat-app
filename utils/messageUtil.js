/**
 * Message helper utility used to ensure all messages contain the same data types.
 */
module.exports = generateChatMessage = (username, content, sentOn) => {
  return {
    username,
    content,
    sentOn,
  };
};
