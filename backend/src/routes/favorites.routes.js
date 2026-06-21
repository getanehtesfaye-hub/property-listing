const express = require('express');
const favoritesController = require('../controllers/favorites.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, favoritesController.getFavorites);
router.post('/', authMiddleware, favoritesController.addFavorite);
router.delete('/:propertyId', authMiddleware, favoritesController.removeFavorite);

module.exports = router;
