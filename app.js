//Importing the Express module
const express = require('express');
const app = express();
const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utilis/appErrorHandler');

const rateLimit = require('express-rate-limit');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Set 100 requests for 30 minitues as the threshold from a single IP address
app.use(
  '/api',
  rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    message: `Too many requests. Try again in 30 minitues`,
  })
);

app.use(express.json());

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
