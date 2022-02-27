const AppError = require('../utilis/appErrorHandler');

//Functions to handle MONGOOSE ERRORS
//Handle 'CASTERRORS'
const handleCastError = (err) => {
  //Message to be passed in to AppError
  const message = `Invalid ${err.path}: ${err.value}`;

  //Call the AppError class
  return new AppError(message, 400);
};

//Handle 'DUPLICATE KEY ERRORS'
const handleDuplicateKeyError = (err) => {
  //Message to be passed in to AppError
  const message = `Field ${err.keyValue.name} is a duplicate`;

  //Call the AppError class
  return new AppError(message, 400);
};

//Handle 'VALIDATIONERRORS'
const handleValidationError = (err) => {
  const appErrorMessage = [];
  //Loop over the error field names from the error object
  const paths = Object.values(err.errors).map((el) => el.path);
  //Loop over the error messages from the error oject
  const messages = Object.values(err.errors).map((el) => el.message);

  //Concat the error message with the respective field name and push it to a new array
  for (let i = 0; i < paths.length; i++) {
    appErrorMessage.push(`Field ${paths[i]}: ${messages[i]}`);
  }
  return new AppError(appErrorMessage.join('. '), 400);
};
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
    let error = Object.create(err);

    //Handling MONGOOSE ERRORS
    //The focus of handling these errors is to mark them as `Operational Errors`, so that the users can see them as regular errors
    //Handling 'CASTERRORS'
    if (error.name === 'CastError') {
      //Call the function handleCastError
      //Saving the returned error from AppError in the handleCastError function into error. So that it'll be saved as an isOperationalError
      error = handleCastError(err);
    }

    //Handling 'DUPLICATE KEY ERRORS'
    //Using the error code because, this error is caused by the MongoDb driver instead of Mongoose
    if (error.code === 11000) {
      //Call the function handleDuplicateKeyError
      //Saving the returned error from AppError in the handleDuplicateKeyError function into error. So that it'll be saved as an isOperationalError
      error = handleDuplicateKeyError(err);
    }

    //Handling 'VALIDATORERRORS'
    if (error.name === 'ValidationError') {
      //Call the function handleValidatorError
      //Saving the returned error from AppError in the handleValidatorError function into error. So that it'll be saved as an isOperationalError
      error = handleValidationError(err);
    }

    //Check if the error is a operation error
    if (error.isOperationalError) {
      //Send a response to the user
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
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
