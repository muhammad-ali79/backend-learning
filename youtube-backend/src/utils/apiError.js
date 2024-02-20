// if apiError then they will come by this standrad
// here we are making the class from nodejs Error class

class ApiError extends Error {
  constructor(
    statusCode,
    message = "something went wrong",
    errors = [],

    // In JavaScript, the stack property of an Error object contains information about the call stack, which is a representation of the sequence of function calls that led to the current point in code where the error occurred
    stack
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    stack
      ? (this.stack = stack)
      : // Error.caputreStackTrace is a method provided by Node.js for capturing a stack trace.
        Error.captureStackTrace(this, this.constructor);
  }
}

// export { ApiError };
export default ApiError;
