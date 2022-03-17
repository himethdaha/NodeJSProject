const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRoute = require('../routes/reviewRoutes');

const Tour = require('../models/tourModel');

const router = express.Router();

//ALIAS ROUTES
//Top 5 popular tours
router
  .route('/top-5-popular')
  .get(tourController.topFivePopular, tourController.getTours);

//Top 5 scariest tours
router
  .route('/top-5-scariest')
  .get(tourController.topFiveScariest, tourController.getTours);

//Top 5 dangerous tours
router
  .route('/top-5-dangerous')
  .get(tourController.topFiveDangerous, tourController.getTours);

//Top 5 mystical tours
router.route('/top-5-mystical').get(function (req, res) {
  Tour.find(
    { maxGroupSize: { $lte: 5 }, difficulty: 'difficult' },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

//STATS ROUTES
router
  .route('/org-stats')
  .get(
    authController.restrictRoute,
    authController.authorizeRoutes('admin'),
    tourController.getOrganizerStats
  );
router
  .route('/month-stats/:year')
  .get(
    authController.restrictRoute,
    authController.authorizeRoutes('admin'),
    tourController.getBusiestMonth
  );
// router.param('id', tourController.checkId);
router
  .route('/')
  .get(tourController.getTours)
  .post(
    authController.restrictRoute,
    authController.authorizeRoutes('admin'),
    tourController.postTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.restrictRoute,
    authController.authorizeRoutes('admin'),
    tourController.patchTour
  )
  .delete(
    authController.restrictRoute,
    authController.authorizeRoutes('admin'),
    tourController.deleteTour
  );

router
  .route('/tours-near-me/distance/:distance/center/:latlng/unit/:unit')
  .get(tourController.toursNearMe);

router
  .route('/find-tours/center/:latlng/max/:max/min/:min/unit/:unit')
  .get(tourController.findTours);

//When a user hits this url take them to the review Router
router.use('/:tourId/reviews', reviewRoute);

module.exports = router;
