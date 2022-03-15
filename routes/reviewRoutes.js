const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//Set mergeParams to true. So that the tour Id can be used here
const router = express.Router({ mergeParams: true });

//Get all reviews and post a review
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictRoute,
    authController.authorizeRoutes('user'),
    reviewController.postReview
  );

module.exports = router;
