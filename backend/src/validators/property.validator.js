const ApiError = require('../utils/apiError');

const validatePropertyCreate = (req, res, next) => {
  const { title, price } = req.body;

  if (!title || title.trim() === '') {
    return next(new ApiError(400, 'Title is required'));
  }
  if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
    return next(new ApiError(400, 'Price must be a positive number'));
  }
  next();
};

const validatePublishData = (property) => {
  if (!property.title || property.title.trim() === '') {
    throw new ApiError(400, 'Publish validation failed: Title is required');
  }
  if (!property.description || property.description.trim() === '') {
    throw new ApiError(400, 'Publish validation failed: Description is required');
  }
  if (!property.location || property.location.trim() === '') {
    throw new ApiError(400, 'Publish validation failed: Location is required');
  }
  if (!property.price || isNaN(property.price) || Number(property.price) <= 0) {
    throw new ApiError(400, 'Publish validation failed: Price must be greater than 0');
  }
  if (!property.images || property.images.length === 0) {
    throw new ApiError(400, 'Publish validation failed: At least one image is required');
  }
  return true;
};

module.exports = {
  validatePropertyCreate,
  validatePublishData,
};
