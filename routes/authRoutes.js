// Required third party packages
const express = require('express');
const { check, body } = require('express-validator');

// Required local packages
const authController = require('../controllers/authController');
const isAuth = require('../middleware/is-auth');
const User = require('../models/user');

// Create the Express router
const router = express.Router();

// Setup the 'Login' routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Setup 'Signup' routes which includes UI error handling
router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  [
    body('username', 'Username must be at least 2 characters')
      .isString()
      .isLength({ min: 2 })
      .trim(),
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail(),
    body('password', 'Password should be a minimum of eight characters.')
      .isLength({ min: 8 })
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      }),
  ],
  authController.postSignup
);

// Setup 'Logout' route
router.post('/logout', isAuth, authController.postLogout);

module.exports = router;
