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

const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter
  .route('/')
  .get(tourController.getTours)
  .post(tourController.postTour);

tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.patchTour)
  .delete(tourController.deleteTour);

userRouter
  .route('/')
  .get(userController.getUsers)
  .post(userController.postUser);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
const port = 3000;
//Create the server
app.listen(port, () => {
  console.log(`App Running on port 3000`);
});
