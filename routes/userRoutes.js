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

router.route('/').get(userController.getUsers).post(userController.postUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);

module.exports = router;
