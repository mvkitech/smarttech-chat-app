// Required third party packages
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const http = require('http');
const socketio = require('socket.io');

// Required local packages
const authRoutes = require('./routes/authRoutes');
const chatroomRoutes = require('./routes/chatroomRoutes');
const errorController = require('./controllers/errorController');
const User = require('./models/user');
const Room = require('./models/chatroom.js');
const Message = require('./models/message');
const {
  generateChatMessage,
  generateNewChatMessage,
} = require('./utils/messageUtil');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/userUtils');
const { Logger } = require('mongodb');

// Create express server chat application
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// MongoDBStore is a useful package which allows session
// information to be persisted inside of the MongoDB.
const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: 'sessions',
});

// Set application view resources
app.set('view engine', 'ejs');
app.set('views', 'views');

// Setup various middleware components
const EXPIRES_IN = 86400000; // Expires in 24-Hours
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(
  session({
    secret: 'chatserver-secret-sauce',
    resave: false,
    saveUninitialized: false,
    cookie: { expires: new Date(Date.now() + EXPIRES_IN), maxAge: EXPIRES_IN },
    store: store,
  })
);

// Handle authentication middleware events
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

// Handle user session middleware events
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

// Register various route handlers
app.use(authRoutes);
app.use(chatroomRoutes);

// Setup application error handlers
app.use(errorController.get404);
app.get('/500', errorController.get500);
app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
  });
});

// Connect Moongoose to MongoDB cloud instance
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

// Setup and use the websockets
io.on('connection', (socket) => {
  //
  // Event listener waiting for the clients to join a chat room
  socket.on('join', ({ roomId, roomname, username }, callback) => {
    //
    // Add user to the specified chat room
    const { error, user } = addUser({
      id: socket.id,
      room: roomId,
      roomname,
      username,
    });
    if (error) {
      return callback(error);
    }

    // Establish socket connection to client
    socket.join(user.room);

    // Render existing messages before sending welcome message
    Room.findById(roomId).then((room) => {
      room.messages.forEach((message) => {
        Message.findById(message.messageId)
          // .sort({ sentOn: 1 })
          .then((roomMessage) => {
            const sentOn = new Date(roomMessage.sentOn).toISOString();
            socket.emit(
              'message',
              generateChatMessage(
                `${roomMessage.username}`,
                `${roomMessage.content}`,
                `${sentOn}`
              )
            );
          });
      });
    });

    // Send welcome message to only the new user
    // socket.emit('message', generateChatMessage('Admin', `Welcome ${username}`));

    // Send message to everyone else, excluding new user
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateNewChatMessage('Admin', `${username} has joined`)
      );

    // Refresh chatRoom's connected users
    io.to(user.room).emit('chatRoom', {
      roomname: user.roomname,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // Event listener waiting for messages from the clients
  socket.on('sendMessage', (roomId, userId, content, callback) => {
    //
    // First find chat room and user message will be associated to
    Room.findById(roomId)
      .then((room) => {
        User.findById(userId).then((user) => {
          //
          // Create new message instance
          const username = user.username;
          const message = new Message({
            roomId: roomId,
            userId: userId,
            username: username,
            content: content,
            sentOn: new Date().getTime(),
          });

          // Save message and add it to the chat room
          message.save().then((result) => {
            room.addMessage(message);

            // Send message to everyone in the chat room
            const sender = getUser(socket.id);
            io.to(sender.room).emit(
              'message',
              generateNewChatMessage(username, content)
            );

            callback(roomId);
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Event listener waiting for clients to leave chat session
  socket.on('disconnect', () => {
    //
    // Extract reference to user using the socket
    const user = getUser(socket.id);
    if (user) {
      //
      // Remove user from chatRoom
      removeUser(socket.id);

      // Send message to everyone in chat room that user has left room
      io.to(user.room).emit(
        'message',
        generateChatMessage('Admin', `${user.username} has left`)
      );

      // Refresh chatRoom's connected users
      io.to(user.room).emit('chatRoom', {
        roomname: user.roomname,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// Listen for events on the server
const port = process.env.PORT;
server.listen(port, () => {
  console.log('Server running on port: ' + port);
});
