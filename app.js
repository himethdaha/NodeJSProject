//Importing the Express module
const express = require('express');
const app = express();
const morgan = require('morgan');
app.use(express.json());
//Middleware
app.use(morgan('dev'));

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
const port = 3000;
//Create the server
app.listen(port, () => {
  console.log(`App Running on port 3000`);
});
