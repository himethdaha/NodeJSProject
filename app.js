//Importing the Express module
const express = require('express');
const app = express();
const morgan = require('morgan');

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
  res.status(404).json({
    status: 'Fail',
    message: `Route ${req.originalUrl} doesn't exist`,
  });
  next();
});

module.exports = app;
