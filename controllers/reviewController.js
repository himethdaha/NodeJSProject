const express = require('express');
const AppError = require('../utilis/appErrorHandler');
const catchAsyncError = require('../utilis/catchAsyncError');
const Review = require('../models/reviewModel');

//Get all reviews
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  let reviews;
  //If a tourId is present in the url
  let tourId = req.params.tourId;
  if (tourId) {
    reviews = await Review.find({ tour: tourId });
  } else {
    reviews = await Review.find();
  }
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
  //Get the tour id frm the tourId param
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  const review = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    tour: req.body.tour,
    user: req.user._id,
  });

  res.status(200).json({
    status: 'successful',
    data: {
      review: review,
    },
  });
});
