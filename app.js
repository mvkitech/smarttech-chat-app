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
const moment = require('moment');

// Required local packages
const authRoutes = require('./routes/authRoutes');
const chatroomRoutes = require('./routes/chatroomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const errorController = require('./controllers/errorController');
const User = require('./models/user');
const Room = require('./models/chatroom.js');
const Message = require('./models/message');
const generateChatMessage = require('./utils/messageUtil');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/userUtils');

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
app.use(messageRoutes);

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
          .sort({ sentOn: 1 })
          .then((roomMessage) => {
            socket.emit(
              'message',
              generateChatMessage(
                `${roomMessage.username}`,
                `${roomMessage.content}`,
                `${roomMessage.sentOn}`
              )
            );
          });
      });
    });

    // Send welcome message to only the new user
    const sentOn = formatTimestamp(new Date().getTime());
    // socket.emit(
    //   'message',
    //   generateChatMessage('Admin', `Welcome ${username}`, sentOn)
    // );

    // Send message to everyone else, excluding new user
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateChatMessage('Admin', `${username} has joined`, sentOn)
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
    User.findById(userId)
      .then((user) => {
        const username = user.username;
        const sentOn = formatTimestamp(new Date().getTime());
        const message = new Message({
          roomId: roomId,
          userId: userId,
          username: username,
          content: content,
          sentOn: sentOn,
        });
        console.log(message); //FUBAR persist message here?

        // Send message to everyone in the chat room
        const sender = getUser(socket.id);
        io.to(sender.room).emit(
          'message',
          generateChatMessage(username, content, sentOn)
        );

        callback(roomId);
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
      const sentOn = formatTimestamp(new Date().getTime());
      removeUser(socket.id);

      // Send message to everyone in chat room that user has left room
      io.to(user.room).emit(
        'message',
        generateChatMessage('Admin', `${user.username} has left`, sentOn)
      );

      // Refresh chatRoom's connected users
      io.to(user.room).emit('chatRoom', {
        roomname: user.roomname,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// Helper function used to format the Date timestamps.
const formatTimestamp = (timestamp) => {
  return `${moment(timestamp).format('YYYY-MM-DD h:mm a')}`;
};

// Listen for events on the server
const port = process.env.PORT;
server.listen(port, () => {
  console.log('Server running on port: ' + port);
});
