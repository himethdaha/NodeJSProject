const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsyncError = require('../utilis/catchAsyncError');
const AppError = require('../utilis/appErrorHandler');
const setNodeMailer = require('../utilis/email');

//Function to sign the jwt
const signJwt = (user) => {
  const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXP_TIME,
  });
  return jwtToken;
};

//Cookie Options
const cookieOptions = {
  expires: new Date(Date.now() + 60 * 60 * 1000),
  httpOnly: true,
};
//Function to send a cookie along with a response
const sendCookie = (res, user, cookieOptions) => {
  //Set secure option to true in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', signJwt(user), cookieOptions);
};

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
    passwordChangedTime: req.body.passwordChangedTime,
  });

  //Assigning a jwt to a newly registered user, making them logged in
  const jwtToken = signJwt(newUser);

  //Send a cookie
  sendCookie(res, newUser, cookieOptions);

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
  const jwtToken = signJwt(user);

  //Send a cookie
  sendCookie(res, user, cookieOptions);

  //Send a response on a successful login
  res.status(200).json({
    status: 'success',
    jwtToken,
  });
});

//Middleware to authorize access to certain routes
exports.restrictRoute = catchAsyncError(async (req, res, next) => {
  let jwtToken;

  //STEP 1
  //Get the authorization property from the header and check if there's a jwt
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //Get the jwt
    jwtToken = req.headers.authorization.split(' ')[1];
  }

  //If there is no jwtToken found
  if (!jwtToken) {
    return next(new AppError(`You don't have access to this resource`, 401));
  }

  //STEP 2
  //Check if the received jwtToken is valid
  //Promisify the verify method so that it won't block the event loop when hashing
  const decodedJwt = await promisify(jwt.verify)(
    jwtToken,
    process.env.JWT_SECRET_KEY
  );

  //STEP 3
  //Check if the user still exists.
  //If they've deleted the account, someone else could try to log in with the same jwt as the previous user
  //Find the user
  const user = await User.findById(decodedJwt.id);

  if (!user) {
    return next(new AppError(`The user can't be found`, 401));
  }

  //STEP 4
  //Check if the user changed their password after being assigned with a jwt
  //If someone gets a hang of an account, the user will change the password and I must issue a new jwt so the intruder won't be able to pose as the user
  if (user.isPasswordChanged(decodedJwt.iat)) {
    return next(new AppError(`User changed the password. Log in again`, 401));
  }

  //Store the user obejct in request, to be used by other middlewares
  req.user = user;
  //Grant access to the protected route
  next();
});

//Middleware to restrict access to certain endpoints. Authorization requires
//Wrap the middleware in another function to retain the roles as arguments
exports.authorizeRoutes = function (...roles) {
  //Return the middleware
  return (req, res, next) => {
    //Check if the roles arguments array contains the admin and expeditionOrganizer roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You have no authorization to perform this action`, 403)
      );
    }
    next();
  };
};

//RESETTING PASSWORD

//Middleware which will be used on the page, the user will enter their email to receive a token which will be used to reset the password
exports.resetPasswordPage = catchAsyncError(async (req, res, next) => {
  //STEP 1
  //Get the user based on the email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError(`Can't find a user with this email`, 404));
  }

  //STEP 2
  //Create the reset token and save the hashed version in the database
  const resetToken = user.forgotPasswordReset();
  //Set check validations to false before saving
  await user.save({ validateBeforeSave: false });

  //Use a try-catch to catch errors occurin during the email process to perform certain actions other than sending an error message
  try {
    //STEP 3
    //Create the message to be sent via email
    const message = `Click on the provided link to reset your password. If you didn't request to reset the password, ignore this message. ${
      req.protocol
    }://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    //Create the mail options and send the email to the user
    await setNodeMailer({
      email: req.body.email,
      subject: `Reset Password Token (Valid only for 10 mins)`,
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Reset Password email sent',
    });
  } catch (error) {
    //Remove the passwordResetToken and passwordResetTokenExp from the database
    user.passwordResetToken = undefined;
    user.passwordResetTokenExp = undefined;

    //Save the changed document
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(`An error occured while sending the email. Try again`, 500)
    );
  }
});

//Middleware which will use the token generated by resetPasswordPage middleware and will update the user password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  //STEP 1
  //Get the token parameter from the url and hash it to compare with the token in the database
  const hashToken = crypto
    .Hash('sha256')
    .update(req.params.token)
    .digest('hex');
  console.log(hashToken);
  //STEP 2
  //Check if there's a user with the hashToken and if the token hasn't expired
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetTokenExp: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError(`Invalid token or the token has expired`, 400));
  }

  //STEP 3
  //Update the user password
  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;
  //Remove the password reset token and expiration date from the database
  user.passwordResetToken = undefined;
  user.passwordResetTokenExp = undefined;
  //Persist the changed to the database
  await user.save();

  //STEP 4
  //Log in the user and assin a jwt
  signJwt(user);

  res.status(200).json({
    status: 'success',
    message: jwtToken,
  });
});

//Middleware to reset logged in users password
exports.resetLoggedUserPassword = catchAsyncError(async (req, res, next) => {
  //Get the logged in user based on the email and password
  const user = await User.findById(req.user._id).select('+password');

  //Check if the current password entered is correct
  if (!(await user.comparePasswords(req.body.currentPassword, user.password))) {
    return next(new AppError(`Invalid Password`, 401));
  }

  //Update the password
  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;
  // await user.validate();
  await user.save();

  //Sign a jwt
  signJwt(user);

  res.status(200).json({
    status: 'success',
    message: `Password reset successfully`,
  });
});
