const favoritesService = require('../services/favorites.service');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const getFavorites = catchAsync(async (req, res) => {
  const favorites = await favoritesService.getUserFavorites(req.user.id);
  res.status(200).json(
    new ApiResponse(200, favorites, 'Favorites retrieved successfully')
  );
});

const addFavorite = catchAsync(async (req, res) => {
  const favorite = await favoritesService.addFavorite(req.user.id, req.body.propertyId);
  res.status(201).json(
    new ApiResponse(201, favorite, 'Property added to favorites')
  );
});

const removeFavorite = catchAsync(async (req, res) => {
  await favoritesService.removeFavorite(req.user.id, req.params.propertyId);
  res.status(200).json(
    new ApiResponse(200, null, 'Property removed from favorites')
  );
});

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
