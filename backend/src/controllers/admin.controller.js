const adminService = require('../services/admin.service');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const getMetrics = catchAsync(async (req, res) => {
  const metrics = await adminService.getSystemMetrics();
  res.status(200).json(
    new ApiResponse(200, metrics, 'System metrics retrieved successfully')
  );
});

const disableProperty = catchAsync(async (req, res) => {
  const property = await adminService.disableProperty(req.params.id);
  res.status(200).json(
    new ApiResponse(200, property, 'Property listing disabled successfully by Admin')
  );
});
const enableProperty = catchAsync(async (req, res) => {
  const property = await adminService.enableProperty(req.params.id);

  res.status(200).json(
    new ApiResponse(200, property, 'Property listing enabled successfully by Admin')
  );
});
module.exports = {
  getMetrics,
  disableProperty,
  enableProperty
};
