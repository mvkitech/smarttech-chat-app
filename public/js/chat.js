const socket = io();

// Chat Elements
// const chatForm = document.querySelector('form');
// const chatInput = document.querySelector('input');

// Form Elements
// const $messageForm = document.querySelector('#message-form');
// const $messageFormInput = $messageForm.querySelector('input');
// const $messageFormButton = $messageForm.querySelector('button');
// const $messages = document.querySelector('#messages');

/**
 * Used to send an event to the server when a new client
 * wants to join a specified chat room.
 */
// socket.emit('join', { username, room }, (error) => {
//   if (error) {
//     alert(error);
//     location.href = '/';
//   }
// });

/**
 * Event listener waiting for user information sent from
 * the server which is then used in the chat room sidebar.
 */
// socket.on('chatRoom', ({ room, users }) => {
//   const html = Mustache.render(sidebarTemplate, {
//       room,
//       users
//   })
//   document.querySelector('#sidebar').innerHTML = html
// })

/**
 * Event listener waiting for messages from the server.
 */
// socket.on('message', (message) => {
//   const html = Mustache.render(messageTemplate, {
//       username:  message.username,
//       message:   message.text,
//       createdOn: formatTimeMessage(message.createdOn)
//   })
//   $messages.insertAdjacentHTML('beforeend', html)
//   autoscroll()
// })

/**
 * Event listener waiting for clients to submit their chat
 * messages which will then be sent back to the server.
 */
// $messageForm.addEventListener('submit', (e) => {
//   e.preventDefault();
//   $messageFormButton.setAttribute('disabled', 'disabled');
//   const message = e.target.elements.message.value;
//   socket.emit('sendMessage', message, (error) => {
//     $messageFormButton.removeAttribute('disabled');
//     $messageFormInput.value = '';
//     $messageFormInput.focus();
//     if (error) {
//       return console.log(error);
//     }
//     console.log('Message Delivered');
//   });
// });

/**
 * Helper function used to manage the chat message scroll bar.
 */
// const autoscroll = () => {

//   // Get the height of the new message from the browser
//   const $newMessage = $messages.lastElementChild
//   const newMessageStyles = getComputedStyle($newMessage)
//   const newMessageMargin = parseInt(newMessageStyles.marginBottom)
//   const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

//   // Get the height of messages container
//   const visibleHeight   = $messages.offsetHeight
//   const containerHeight = $messages.scrollHeight

//   // Determine how far the client has scrolled
//   const scrollOffset = $messages.scrollTop + visibleHeight
//   if (containerHeight - newMessageHeight <= scrollOffset) {
//       $messages.scrollTop = $messages.scrollHeight
//   }
// }
