//Function to catch errors caused by asynchronous handlers. Used to replace the catch block of the try catch block
//Takes in the asynchronous function as an argument
const catchAsyncError = (fn) => {
  //Return a new function containing the request,response and next parameters and save it to the handler
  //This is what's returned when catchAsyncError is called. This prevents from the 'fn' parmeter getting called before a request being made to the handler
  return (req, res, next) => {
    //When a request is made to the handler, Express calls the above return function, which then calls the 'fn' argument containing the asynchronous function
    //Catch the error and send it to the global error handling middleware
    fn(req, res, next).catch((err) => next(err));
  };
};

module.exports = catchAsyncError;
