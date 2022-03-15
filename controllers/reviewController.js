const express = require('express');
const AppError = require('../utilis/appErrorHandler');
const catchAsyncError = require('../utilis/catchAsyncError');
const Review = require('../models/reviewModel');
const globalController = require('./globalController');

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
  //Get the tour id frm the tourId param if it's not present in the body
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

//Middleware to check if the user is the one who wrote the review
exports.checkOwner = catchAsyncError(async (req, res, next) => {
  //Find the review
  const review = await Review.findById(req.params.id);
  //Get the user id from the review
  if (JSON.stringify(req.user._id) !== JSON.stringify(review.user._id)) {
    return next(
      new AppError(`You do not have the permission to delete this review`, 400)
    );
  }
  next();
});
//Delete a review
exports.deleteReview = globalController.deleteDoc(Review);
//Patch a review
exports.patchReview = globalController.updateDoc(Review);
