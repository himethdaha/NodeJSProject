//Importing the Express module
const express = require('express');
//Importing the FS module
const fs = require('fs');
//Import the Tour model
const tour = require('../models/tourModel');

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'Fail',
      messsage: "Body doesn't contain name and price",
    });
  }
  next();
};

//Callback functions for the Routes
exports.getTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};
exports.getTour = (req, res) => {
  return res.status(200).json({
    status: 'Success',
    tour: element,
  });
};
exports.postTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    data: {
      tour: newObj,
    },
  });
};
exports.patchTour = (req, res) => {
  res.status(200).json({
    status: 'Success',
    data: {
      tours: returnedObj,
    },
  });
};
exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
