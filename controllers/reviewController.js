const express = require('express');
const AppError = require('../utilis/appErrorHandler');
const catchAsyncError = require('../utilis/catchAsyncError');
const Review = require('../models/reviewModel');

//Get all reviews
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'successful',
    reults: reviews.length,
    data: {
      reviews: reviews,
    },
  });
});

//Create a review
exports.postReview = catchAsyncError(async (req, res, next) => {
  //Get the user id from the request.user
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  const review = await Review.create(req.body);

  res.status(200).json({
    status: 'successful',
    data: {
      review: review,
    },
  });
});
