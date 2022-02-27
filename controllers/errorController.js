//Global error handling middleware
//All the errors through out the app will be sent here
module.exports = (err, req, res, next) => {
  //Get the status code from the passed in error object
  err.statusCode = err.statusCode || 500;
  //Get the status from the passed in error object
  err.status = err.status || 'error';

  //Distinguishing between app environments
  //Error details to be sent in DEVELOPMENT
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.staus,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //Error details to be sent during PRODUCTION
  else if (process.env.NODE_ENV === 'production') {
    //Check if the error is a operation error
    if (err.isOperationalError) {
      //Send a response to the user
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //If the error is not an operation error (programming error, 3rd party errors)
    else {
      //Log the unknown error so that I can view it later in Herokus Logs
      console.error(`UNKNOWN ERROR 😮`, err);
      console.log(process.env.NODE_ENV === 'production');

      res.status(500).json({
        status: 'error',
        message:
          'Something went wrong on our side. We will figure it out asap 😥',
      });
    }
  }

  next();
};
