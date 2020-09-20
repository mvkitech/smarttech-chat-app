// Required third party packages
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');

// Required local packages
const authRoutes = require('./routes/authRoutes');
const chatroomRoutes = require('./routes/chatroomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const errorController = require('./controllers/errorController');
const User = require('./models/user');

// Create express server chat application
const app = express();

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
const EXPIRES_IN = 86400000;
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

module.exports = app;
