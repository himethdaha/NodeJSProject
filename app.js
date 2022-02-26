//Importing the Express module
const express = require('express');
const app = express();
const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utilis/appErrorHandler');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
//Middleware

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Handling incorrect routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Fail',
  //   message: `Route ${req.originalUrl} doesn't exist`,
  // });
  //Call the operation error handling class and pass it as the error object to the global error handling middleware
  next(new AppError(`Route ${req.originalUrl} doesn't exist`, 400));
});

//call the global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
