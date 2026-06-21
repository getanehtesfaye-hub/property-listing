const ApiError = require('../utils/apiError');

const validateRegister = (req, res, next) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || fullName.trim() === '') {
    return next(new ApiError(400, 'Full name is required'));
  }
  if (!email || !email.includes('@')) {
    return next(new ApiError(400, 'Valid email is required'));
  }
  if (!password || password.length < 6) {
    return next(new ApiError(400, 'Password must be at least 6 characters long'));
  }
  if (role && !['ADMIN', 'OWNER', 'USER'].includes(role)) {
    return next(new ApiError(400, 'Invalid user role'));
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.includes('@')) {
    return next(new ApiError(400, 'Valid email is required'));
  }
  if (!password) {
    return next(new ApiError(400, 'Password is required'));
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
