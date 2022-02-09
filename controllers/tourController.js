//Importing the Express module
const express = require('express');
//Importing the FS module
const fs = require('fs');
//Import the Tour model
const Tour = require('../models/tourModel');

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

    //The query which contains the filtered document with other options
    const query = Tour.find(filterObj);

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
