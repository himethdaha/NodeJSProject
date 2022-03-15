//Importing the Express module
const { query } = require('express');
const express = require('express');
//Importing the FS module
const fs = require('fs');
//Import the Tour model
const Tour = require('../models/tourModel');
const APIFeatures = require('../utilis/apiFeatures');
const catchAsyncError = require('../utilis/catchAsyncError');
const AppError = require('../utilis/appErrorHandler');
const globalController = require('./globalController');

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
    const features = new APIFeatures(Tour, req.query)
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

exports.getTour = catchAsyncError(async (req, res, next) => {
  //Use populate on the virtual poulate
  const newTour = await Tour.findById(req.params.id).populate('reviews');

  //If a tour is not found with the id
  //Null means falsy in JS
  if (!newTour) {
    return next(new AppError(`Could not find a tour with that ID`, 404));
  }

  return res.status(200).json({
    status: 'Success',
    tour: newTour,
  });
});

exports.postTour = catchAsyncError(async (req, res) => {
  //const newTour = new Tour({})
  //newTour.save()

  //Store the document
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
exports.patchTour = globalController.updateDoc(Tour);

exports.deleteTour = globalController.deleteDoc(Tour);

//Using the aggregation piepeline to figure out the lead organizer of the highest and lowest rated tours
exports.getOrganizerStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 3.0 } },
      },
      {
        $group: {
          _id: { $toUpper: '$expeditionOrganizer' },
          totTours: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRatings: { $avg: '$ratingsAverage' },
          numRatings: { $avg: '$ratingsQuantity' },
        },
      },

      {
        $sort: { avgRatings: 1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fail',
      message: error.message,
    });
  }
};

//Using the aggregation pipeline to calculate the busiest month of the year
exports.getBusiestMonth = async (req, res) => {
  try {
    //Get the year from the request paramter
    const year = Number(req.params.year);

    const stats = await Tour.aggregate([
      {
        //Unwind the start dates
        $unwind: '$startDates',
      },
      {
        //Get the tours based on the year passed in
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          //Group by month
          _id: { $month: '$startDates' },
          //Get the total number of tours per month
          totTours: { $sum: 1 },
          //Get the names of all the tours in the respective month. Push the names into an array
          names: { $push: '$name' },
        },
      },
      {
        //Create an alias for _id
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { totTours: -1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      results: stats.length,
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fail',
      message: error.message,
    });
  }
};
