const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  res.status(201).json(
    new ApiResponse(201, { user, token }, 'User registered successfully')
  );
});

const login = catchAsync(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body.email, req.body.password);
  res.status(200).json(
    new ApiResponse(200, { user, token }, 'Login successful')
  );
});

const me = catchAsync(async (req, res) => {
  // User object is already loaded by authMiddleware
  res.status(200).json(
    new ApiResponse(200, { user: req.user }, 'Current user profile retrieved')
  );
});

module.exports = {
  register,
  login,
  me,
};
