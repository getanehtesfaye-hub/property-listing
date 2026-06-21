const propertyService = require('../services/property.service');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const getProperties = catchAsync(async (req, res) => {
  const result = await propertyService.getProperties(req.query, req.user?.role, req.user?.id);
  res.status(200).json(
    new ApiResponse(200, result, 'Properties list retrieved successfully')
  );
});

const getPropertyById = catchAsync(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id, req.user?.role, req.user?.id);
  res.status(200).json(
    new ApiResponse(200, property, 'Property details retrieved successfully')
  );
});

const createProperty = catchAsync(async (req, res) => {
  const property = await propertyService.createProperty(req.body, req.user.id);
  res.status(201).json(
    new ApiResponse(201, property, 'Property draft created successfully')
  );
});

const updateProperty = catchAsync(async (req, res) => {
  const property = await propertyService.updateProperty(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role
  );
  res.status(200).json(
    new ApiResponse(200, property, 'Property listing updated successfully')
  );
});

const publishProperty = catchAsync(async (req, res) => {
  const property = await propertyService.publishProperty(req.params.id, req.user.id);
  res.status(200).json(
    new ApiResponse(200, property, 'Property published successfully')
  );
});

const archiveProperty = catchAsync(async (req, res) => {
  const property = await propertyService.archiveProperty(req.params.id, req.user.id);
  res.status(200).json(
    new ApiResponse(200, property, 'Property archived successfully')
  );
});

const deleteProperty = catchAsync(async (req, res) => {
  await propertyService.softDeleteProperty(req.params.id, req.user.id, req.user.role);
  res.status(200).json(
    new ApiResponse(200, null, 'Property deleted successfully')
  );
});

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  publishProperty,
  archiveProperty,
  deleteProperty,
};
