//Importing the Express module
const path = require('path');
const express = require('express');
const app = express();
const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utilis/appErrorHandler');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

//Conencting views
app.set('view engine', 'pug');
//Pug temps are called views in express
app.set('views', path.join(__dirname, 'views'));

//TO serve static files
app.use(express.static(path.join(__dirname, 'public')));
//Middleware
//Set secure headers
app.use(helmet());

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

//Data Sanitization
//To read req.body data
app.use(express.json({ limit: '10kb' }));
//Protect against NoSql injections
app.use(mongoSanitize());
//Protect against cross-site-scripting
app.use(xss());

//Protect against parameter pollution
app.use(
  hpp({ whitelist: ['duration', 'dangers', 'horrorLevel', 'difficulty'] })
);

//Render the views
app.get('/', (req, res) => {
  res.status(200).render('base');
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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
