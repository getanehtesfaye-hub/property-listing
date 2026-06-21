const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production';

const authMiddleware = catchAsync(async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, token missing');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    if (!user) {
      throw new ApiError(401, 'User associated with this token no longer exists');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Token expired');
    }
    throw new ApiError(401, 'Not authorized, invalid token');
  }
});

const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Silently ignore token decoding errors for optional authentication
  }
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
};

