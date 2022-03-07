//Importing the Express module
const express = require('express');
//Importing the FS module
const fs = require('fs');
const User = require('../models/userModel');
const catchAsyncError = require('../utilis/catchAsyncError');
const AppError = require('../utilis/appErrorHandler');
//Calling the exported express function
const app = express();

//Callback functions for the Routes
exports.getUsers = (req, res) => {
  res.status(500).json({
    status: 'Fail',
    message: 'Route not implemented yet!',
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'Fail',
    message: 'Route not implemented yet!',
  });
};
exports.postUser = (req, res) => {
  res.status(500).json({
    status: 'Fail',
    message: 'Route not implemented yet!',
  });
};
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

exports.patchUser = (req, res) => {
  res.status(500).json({
    status: 'Fail',
    message: 'Route not implemented yet!',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Fail',
    message: 'Route not implemented yet!',
  });
};
