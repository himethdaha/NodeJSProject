//Importing the Express module
const express = require('express');
const app = express();
//Middleware
app.use(express.json());
//Calling the exported express function
const tourController = require('./controllers/tourController');
app
  .route('/api/v1/tours')
  .get(tourController.getTours)
  .post(tourController.postTour);

app
  .route('/api/v1/tours/:id')
  .get(tourController.getTour)
  .patch(tourController.patchTour)
  .delete(tourController.deleteTour);
const port = 3000;
//Create the server
app.listen(port, () => {
  console.log(`App Running on port 3000`);
});
