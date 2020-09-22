const socket = io();

// Form Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('#message-input');
const $messageFormButton = $messageForm.querySelector('button');
const $messages = document.querySelector('#messages');
const $exitForm = document.querySelector('#exit-form');

// Templates
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
const messageTemplate = document.querySelector('#message-template').innerHTML;

// Hidden Data Fields
const roomId = document.querySelector('#message-room-id').value;
const userId = document.querySelector('#message-user-id').value;
const roomname = document.querySelector('#message-roomname').value;
const username = document.querySelector('#message-username').value;

/**
 * Used to send an event to the server when a new client
 * wants to join a specified chat room.
 */
socket.emit('join', { roomId, roomname, username }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

/**
 * Event listener waiting for clients to exit the chat room.
 */
$exitForm.addEventListener('submit', (event) => {
  event.preventDefault();
  location.href = '/';
});

/**
 * Event listener waiting for clients to submit chat messages
 * which are sent and then replied to by the server.
 */
$messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');
  const content = event.target.elements.content.value;
  socket.emit('sendMessage', roomId, userId, content, (reply) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    console.log(`Message sent to room:`, reply);
  });
});

/**
 * Event listener waits for chat messages coming in from the server
 * and it will exclude all target messages that were not intended
 * for this chatroom.
 */
socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    content: message.content,
    sentOn: formatTimestamp(message.sentOn),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

/**
 * Event listener waiting for user information sent from
 * the server which is then used in the chat room sidebar.
 */
socket.on('chatRoom', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    roomname,
    users,
  });
  document.querySelector('#sidebar').innerHTML = html;
});

/**
 * Helper function used to format the Date timestamps.
 */
const formatTimestamp = (timestamp) => {
  return `${moment(timestamp).format('YYYY-MM-DD h:mm a')}`;
};

/**
 * Helper function used to manage the chat message scroll bar.
 */
const autoscroll = () => {
  // Get the height of the new message from the browser
  const $newMessage = $messages.lastElementChild;
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Get the height of messages container
  const visibleHeight = $messages.offsetHeight;
  const containerHeight = $messages.scrollHeight;

  // Determine how far the client has scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;
  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};
