const ApiError = require('../utils/apiError');

const errorMiddleware = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Normalize generic errors to ApiError
  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || 'Internal Server Error';
  }

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === 'development' || statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
