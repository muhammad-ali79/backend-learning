// by using Promises
const asyncHandler = (requestHandler) => {
  (req, res, next) =>
    // resolve the promise with req,res,next and if error come then pass to next middleware
    Promise.resolve(
      requestHandler(req, res, next).catch((error) => next(error)),
    );
};

// by using async await
/*
const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      sucess: false,
      message: error.message,
    });
  }
};
*/

export default asyncHandler;
