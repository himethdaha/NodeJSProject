const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

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
