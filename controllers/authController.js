const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsyncError = require('../utilis/catchAsyncError');

//Sign up function for the user
exports.signUp = catchAsyncError(async (req, res) => {
  //Create a user based on the information in the request body
  const newUser = await User.create({
    name: req.body.name,
    nickName: req.body.nickName,
    email: req.body.email,
    isVIP: req.body.isVIP,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
  });

  //Assigning a jwt to a newly registered user, making them logged in
  const jwtToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXP_TIME,
  });

  //Send a response on success
  res.status(201).json({
    status: 'success',
    jwtToken,
    data: {
      user: newUser,
    },
  });
});
