// this funcion help in handling errors of async functions

/*
 This function asyncHandler is a higher-order function that serves as middleware for handling asynchronous request handlers in an Express.js application. Its purpose is to simplify error handling for asynchronous route handlers that use promises or async/await syntax.

Here's a breakdown of what it does:

It takes a requestHandler function as an argument. This function is typically an asynchronous route handler in an Express application.

It returns another function that accepts req, res, and next parameters, which are typical for Express middleware functions.

Within this returned function, it wraps the execution of the requestHandler function in a Promise.

If the requestHandler function resolves successfully (i.e., it doesn't throw an error), the Promise resolves, and the control flows to the next middleware in the chain.

If the requestHandler function encounters an error and rejects the Promise (typically using catch), the error is passed to the next function, which triggers Express's error-handling middleware. This ensures that any errors occurring within the requestHandler are properly handled and don't crash the server.

By using this asyncHandler middleware, developers can avoid repetitive try/catch blocks in their route handlers and keep their code cleaner and more readable. It's a common pattern in Express.js applications, especially when dealing with asynchronous operations.
 */

// by using Promises
const asyncHandler = (requestHandler) => {
  return (req, res, next) =>
    // return a resolved promise with the req,res,next which is given as parameters in the requestHandler funcion . pass the error the expressjs error middleware if there is any error happen in the requestHandler thanks of .catch because requestHandler is returning as a promise

    // no need to reslove the promise because request handler functions are already async funcions and async funcion return a promise
    /* Promise.resolve(
      requestHandler(req, res, next).catch((error) => next(error))
    ); */

    requestHandler(req, res, next).catch((error) => next(error));
};

// by using async await

/* const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      sucess: false,
      message: error.message,
    });
  }
}; */

export default asyncHandler;
