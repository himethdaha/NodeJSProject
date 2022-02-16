const express = require('express');

const tourController = require('../controllers/tourController');
const Tour = require('../models/tourModel');

const router = express.Router();

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
// router.param('id', tourController.checkId);
router.route('/').get(tourController.getTours).post(tourController.postTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.patchTour)
  .delete(tourController.deleteTour);

module.exports = router;
