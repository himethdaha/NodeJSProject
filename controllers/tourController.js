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
const { populate } = require('../models/tourModel');

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
exports.getTours = globalController.getDocs(Tour);

exports.getTour = globalController.getDoc(Tour, {
  path: 'reviews',
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

//GeoSpatial Handlers
//Handler to find all tours within a certain distance from a center point
exports.toursNearMe = catchAsyncError(async (req, res, next) => {
  //Get all the variables from the parameter
  const { distance, latlng, unit } = req.params;
  //Split the lat and lng into own variables
  const [lat, lng] = latlng.split(',');
  //Make sure the user enters their center position
  if (!lat || !lng) {
    return next(new AppError(`Enter the latitude and longitude values`, 400));
  }

  //To calculate the radius, take the unit into consideration
  //Return a radian value because that's what the $geoWithin query uses
  const radius = unit === 'km' ? distance / 6378 : distance / 3963;
  //Find the tours
  //Use $geoWithin GeoSpatial query as options in find
  //tourStartLocation is what holds where the tours are. From the center point that is what we'll be searching for
  const tours = await Tour.find({
    tourStartLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'successful',
    noOfTours: tours.length,
    data: {
      tours: tours,
    },
  });
});

//Handler to find all tours within a specified max and min distances
exports.findTours = catchAsyncError(async (req, res, next) => {
  //Destruct the variables from the parameter
  const { latlng, max, min, unit } = req.params;
  //Get the lat.lng
  const [lat, lng] = latlng.split(',');
  console.log(lat, lng, max, min, unit);
  //Check if the user entered the lat,lng
  if (!lat || !lng) {
    return next(new AppError(`Enter the latitude and longitude values`, 400));
  }

  //Convert min and max into meters
  const minDistance = unit === 'km' ? min * 1000 : min * 1609.3;
  const maxDistance = unit === 'km' ? max * 1000 : max * 1609.3;
  console.log(maxDistance, minDistance);
  //Find the tours with the $nearSphere query as the filter
  const tours = await Tour.find({
    tourStartLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $minDistance: minDistance,
        $maxDistance: maxDistance,
      },
    },
  });

  res.status(200).json({
    status: 'successful',
    noOfTours: tours.length,
    data: {
      tours: tours,
    },
  });
});

//Get tour distances aggregation
exports.getTourDistances = catchAsyncError(async (req, res, next) => {
  //Get the variables from the parameter
  const { latlng, unit } = req.params;
  //Get the lat,lng
  const [lat, lng] = latlng.split(',');
  //If the user hasn't entered the coordinates for the starting point
  if (!lat || !lng) {
    return next(new AppError(`Enter the latitude and longitude values`, 400));
  }

  //Convert the distance to the unit the user wants
  // const convertedDistance = unit === 'mi' ? distance * 6378 : distance * 3963;
  //The aggregation pipleline
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        //Starting location
        near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        key: 'tourStartLocation',
        //Field where all the calculations will be stored
        distanceField: 'distance',
        //Based on the unit the user choose
        distanceMultiplier: unit === 'km' ? 0.001 : 0.000621371,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'successful',
    results: distances.length,
    data: {
      distances,
    },
  });
});
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
