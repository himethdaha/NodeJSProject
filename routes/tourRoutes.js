const express = require('express');

const tourController = require('../controllers/tourController');

const router = express.Router();
router.param('id', tourController.checkId);
router
  .route('/')
  .get(tourController.getTours)
  .post(tourController.checkBody, tourController.postTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.patchTour)
  .delete(tourController.deleteTour);

module.exports = router;
