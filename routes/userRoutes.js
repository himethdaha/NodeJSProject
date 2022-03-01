const express = require('express');
const authController = require('../controllers/authController');

const userController = require('../controllers/userController');

const router = express.Router();

//Route for signing up a new user
router.post('/signup', authController.signUp);

router.route('/').get(userController.getUsers).post(userController.postUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);

module.exports = router;
