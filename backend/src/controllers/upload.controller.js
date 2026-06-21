const uploadService = require('../services/upload.service');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

const uploadImages = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No images uploaded or file field name must be "images"');
  }

  const urls = await uploadService.uploadMultipleFiles(req.files);

  res.status(200).json(
    new ApiResponse(200, { urls }, 'Images uploaded successfully')
  );
});

module.exports = {
  uploadImages,
};
