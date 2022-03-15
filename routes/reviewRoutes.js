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

router
  .route('/:id')
  .delete(
    authController.restrictRoute,
    reviewController.checkOwner,
    authController.authorizeRoutes('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictRoute,
    reviewController.checkOwner,
    authController.authorizeRoutes('user'),
    reviewController.patchReview
  );
module.exports = router;
