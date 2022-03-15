const express = require('express');
const authController = require('../controllers/authController');

const userController = require('../controllers/userController');

const router = express.Router();

//AUTHENTICATION
//Route for signing up a new user
router.post('/signup', authController.signUp);
//Route for logging in a new user
router.post('/login', authController.login);

//PASSWORD RESET
router.post('/forgotPassword', authController.resetPasswordPage);
router.patch('/resetPassword/:token', authController.resetPassword);

//PASSWORD RESET FOR LOGGED IN USERS
router.patch(
  '/changePassword',
  authController.restrictRoute,
  authController.resetLoggedUserPassword
);

//UPDATE LOGGED IN USER INFO
router.patch(
  '/updateMyInfo',
  authController.restrictRoute,
  userController.updateLoggedUser
);

//DEACTIVATE USER
router.delete(
  '/deactivateUser',
  authController.restrictRoute,
  userController.deactivateUser
);

//DELETE USER
router.delete(
  '/deleteUser',
  authController.restrictRoute,
  authController.authorizeRoutes('admin'),
  userController.deleteUser
);

router.route('/').get(userController.getUsers);

router
  .route('/:id')
  .get(
    authController.restrictRoute,
    authController.authorizeRoutes('admin'),
    userController.getUser
  )
  .delete(authController.authorizeRoutes('admin'), userController.deleteUser);

module.exports = router;
