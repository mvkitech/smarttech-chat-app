/**
 * Message helper utility used to generate chat messages ensuring
 * all messages contain the same consistent message data signatures.
 */
const generateChatMessage = (username, content, sentOn) => {
  return {
    username,
    content,
    sentOn,
  };
};

/**
 * Message helper utility used to generate new chat messages ensuring
 * all messages contain the same consistent message data signatures.
 */
const generateNewChatMessage = (username, content) => {
  return {
    username,
    content,
    sentOn: new Date().getTime(),
  };
};

module.exports = { generateChatMessage, generateNewChatMessage };
