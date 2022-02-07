//Importing the Express module
const express = require('express');
//Importing the FS module
const fs = require('fs');
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
