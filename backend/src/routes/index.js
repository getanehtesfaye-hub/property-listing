const express = require('express');
const authRoutes = require('./auth.routes');
const propertyRoutes = require('./property.routes');
const adminRoutes = require('./admin.routes');
const uploadRoutes = require('./upload.routes');
const favoritesRoutes = require('./favorites.routes');
const messageRoutes = require('./message.routes');
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/messages', messageRoutes);

module.exports = router;
