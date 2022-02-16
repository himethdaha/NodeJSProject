//Importing the Express module
const { query } = require('express');
const express = require('express');
//Importing the FS module
const fs = require('fs');
//Import the Tour model
const Tour = require('../models/tourModel');
const APIFeatures = require('../utilis/apiFeatures');

//ROUTING MIDDLEWARES FOR ALIAS ROUTES
exports.topFivePopular = async (req, res, next) => {
  //Limit the Results
  req.query.limit = 5;
  //Sort the Results
  req.query.sort = '-ratingsAverage,price';
  next();
};
exports.topFiveScariest = async (req, res, next) => {
  //Limit the Results
  req.query.limit = 5;
  //Fields to filer by
  req.query = { horrorLevel: 'unknown' };
  //Sort the Results
  req.query.sort = '-ratingsAverage,price';
  next();
};
exports.topFiveDangerous = async (req, res, next) => {
  //Limit the Results
  req.query.limit = 5;
  //Fields to filer by
  req.query = { difficulty: 'difficult' };
  //Sort the Results
  req.query.sort = '-ratingsAverage,price';
  next();
};

//Callback functions for the Routes
exports.getTours = async (req, res) => {
  try {
    //Create an instance of the APIFeatures class
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //Grab the document which matches all of the options in the query
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fail',
      message: error.message,
    });
  }
};
exports.getTour = async (req, res) => {
  try {
    const newTour = await Tour.findById(req.params.id);
    return res.status(200).json({
      status: 'Success',
      tour: newTour,
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fail',
      message: error,
    });
  }
};
exports.postTour = async (req, res) => {
  //const newTour = new Tour({})
  //newTour.save()
  try {
    //Store the document
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fail',
      message: error,
    });
    console.log(error);
  }
};
exports.patchTour = async (req, res) => {
  try {
    const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'Success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fail',
      message: error,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    const newTour = await Tour.deleteOne({ _id: req.params.id });
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      status: 'Fail',
      message: error,
    });
  }
};
