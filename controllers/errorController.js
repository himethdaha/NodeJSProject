//Global error handling middleware
//All the errors through out the app will be sent here
module.exports = (err, req, res, next) => {
  //Get the status code from the passed in error object
  err.statusCode = err.statusCode || 500;
  //Get the status from the passed in error object
  err.status = err.status || 'error';

  //Send a response to the user
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

  next();
};
