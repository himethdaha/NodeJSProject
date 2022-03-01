const User = require('../models/userModel');
const catchAsyncError = require('../utilis/catchAsyncError');

//Sign up function for the user
exports.signUp = catchAsyncError(async (req, res, next) => {
  //Create a user based on the information in the request body
  const newUser = await User.create({
    name: req.body.name,
    nickName: req.body.nickName,
    email: req.body.email,
    isVIP: req.body.isVIP,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
  });

  //Send a response on success
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
