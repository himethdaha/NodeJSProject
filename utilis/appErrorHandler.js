class AppErrorHandler extends Error {
  constructor(message, statusCode) {
    this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'Error';
    //So that we can send errors only on user errors
    this.isOperationalError = true;
    //Removing the stackTrace from and above the point where the error occured
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppErrorHandler;
