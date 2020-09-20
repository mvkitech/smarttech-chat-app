/**
 * Invoked when user is trying to access routes they are
 * not permitted to use while they are logged out.
 */
module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  next();
};
