const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsyncError = require('../utilis/catchAsyncError');
const AppError = require('../utilis/appErrorHandler');

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
      name: req.body.name,
      nickName: req.body.nickName,
      email: req.body.email,
      isVIP: req.body.isVIP,
    },
  });
});

//Login Functionality
exports.login = catchAsyncError(async function (req, res, next) {
  //Save the email and password from request body into variables
  const email = req.body.email;
  const password = req.body.password;

  //STEP 1
  //Check if the user filled out the email and password fields
  if (!email || !password) {
    return next(new AppError(`Please fill out the email and password`, 400));
  }

  //STEP 2
  //Check if the provided email can be found in the database and if so, select the password of the respective user
  const user = await User.findOne({ email: email }).select('+password');

  //Check if the user provided password matches the password selected from the database.
  //Use the instance method comparePasswords from the User model
  if (!user || !(await user.comparePasswords(password, user.password))) {
    return next(new AppError(`Provided email or password is incorrect`, 401));
  }

  //Create the JWT
  const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXP_TIME,
  });

  //Send a response on a successful login
  res.status(200).json({
    status: 'success',
    jwtToken,
  });
});
