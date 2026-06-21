const ApiError = require('../utils/apiError');

/**
 * Restricts access to specific user roles.
 * @param {...string} roles - The list of allowed roles.
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role '${req.user ? req.user.role : 'GUEST'}' is not authorized to access this resource`
        )
      );
    }
    next();
  };
};

module.exports = roleMiddleware;
