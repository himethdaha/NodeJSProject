//Importing the Express module
const express = require('express');
const app = express();
const morgan = require('morgan');
//Middleware
app.use(morgan('dev'));
app.use(express.json());
//Calling the exported express function
const tourController = require('./controllers/tourController');
const userController = require('./controllers/userController');
app
  .route('/api/v1/tours')
  .get(tourController.getTours)
  .post(tourController.postTour);

app
  .route('/api/v1/tours/:id')
  .get(tourController.getTour)
  .patch(tourController.patchTour)
  .delete(tourController.deleteTour);

app
  .route('/api/v1/users')
  .get(userController.getUsers)
  .post(userController.postUser);

app
  .route('/api/v1/users/:id')
  .get(userController.getUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);
const port = 3000;
//Create the server
app.listen(port, () => {
  console.log(`App Running on port 3000`);
});
