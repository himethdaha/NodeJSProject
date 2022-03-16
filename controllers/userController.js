//Importing the Express module
const express = require('express');
//Importing the FS module
const fs = require('fs');
const User = require('../models/userModel');
const catchAsyncError = require('../utilis/catchAsyncError');
const AppError = require('../utilis/appErrorHandler');
const globalController = require('./globalController');

//Calling the exported express function
const app = express();

//Callback functions for the Users
exports.getUsers = globalController.getDocs(User);

//Get a user
exports.getUser = globalController.getDoc(User);

//To update the fields email,name, nickName and isVIP
exports.updateLoggedUser = catchAsyncError(async (req, res, next) => {
  //First check if the user is trying to update the password in this route
  if (req.body.password || req.body.passwordConfirmation) {
    return next(
      new AppError(`Can't update the password here. Go to /changePassword`, 400)
    );
  }

  //Function to filter the request body
  const filterBody = (reqBody, ...fields) => {
    //Object to store equal elements
    const newObj = {};
    //Loop over the request body keys and check if the fields array includes elements equal to keys in the request body
    Object.keys(reqBody).forEach((element) => {
      if (fields.includes(element)) {
        newObj[element] = reqBody[element];
      }
    });

    return newObj;
  };

  //Call the filterBody function with the keys we want to update
  const fields = filterBody(req.body, 'name', 'nickName', 'email', 'isVIP');

  //Update the fields given in the request body
  const user = await User.findByIdAndUpdate(req.user._id, fields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Successfully updated the fields',
    user: user,
  });
});

//To change the active state of the user. Won't completely delete the user.
exports.deactivateUser = catchAsyncError(async (req, res, next) => {
  //Get the user by the id and password
  const user = await User.findById(req.user._id).select('+password');

  //Only get the current password field
  if (!req.body.currentPassword) {
    return next(new AppError(`Only enter the current password`, 401));
  }
  //Check if the user entered password is correct
  if (!(await user.comparePasswords(req.body.currentPassword, user.password))) {
    return next(new AppError(`Invalid Password`, 401));
  }
  await User.findByIdAndUpdate(req.user._id, { activeUser: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//To get user profile info
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  //Find the user based on the user id
  const user = await User.findById(req.user._id);
  console.log(req.user._id);
  if (!user) {
    return next(new AppError(`No user found`, 404));
  }

  res.status(200).json({
    status: 'successful',
    data: {
      name: user.name,
      nickName: user.nickName,
      email: user.email,
      isVIP: user.isVIP,
    },
  });
});
//To delete the user. Only available for the admin
exports.deleteUser = globalController.deleteDoc(User);
