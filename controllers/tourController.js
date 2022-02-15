//Importing the Express module
const express = require('express');
//Importing the FS module
const fs = require('fs');
//Import the Tour model
const Tour = require('../models/tourModel');

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
exports.topFiveMystical = async (req, res, next) => {
  //Limit the Results
  req.query.limit = 5;
  //Fields to filer by
  req.query = { difficulty: 'difficult', maxGroupSize: ($lte = 5) };
  //Sort the Results
  req.query.sort = '-ratingsAverage,price';
  next();
};

//Callback functions for the Routes
exports.getTours = async (req, res) => {
  try {
    //BASIC FILTERING
    //Create the filterObject
    const filterObj = { ...req.query };
    //How the filterObj look = {duration: '5', difficulty: 'easy'}

    //Create an array with the query parameters that should be excluded when filtering
    const fieldsToExclude = ['page', 'sort', 'fields', 'limit'];

    //Remove the fieldsToExclude from the filerObj
    fieldsToExclude.forEach((el) => delete filterObj[el]);

    //FILTERING FOR RELATIONAL OPERATORS IN THE QUERY
    //Get the filtered object and convert it to a string
    let queryStr = JSON.stringify(filterObj);
    //Replace the relational operators to be used by mongodb
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //The query which contains the filtered document with other options
    let query = Tour.find(JSON.parse(queryStr));

    //SORTING
    if (req.query.sort) {
      //Split the sorting options and join them by a space for mongoose to use
      const querySort = req.query.sort.split(',').join(' ');
      query = query.sort(querySort);
    } else {
      query = query.sort('-createdAt');
    }

    //LIMITING FIELDS
    if (req.query.fields) {
      //Split the fields and join them by a space for mongoose to use
      const queryFields = req.query.fields.split(',').join(' ');
      query = query.select(queryFields);
    } else {
      query = query.select('-__v');
    }

    //PAGINATION
    //Get the page
    const page = Number(req.query.page) || 1;
    //Get the limit
    const limit = Number(req.query.limit) || 5;
    //Number of results to skip
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    //Grab the document which matches all of the options in the query
    const tours = await query;

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
      message: error,
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
