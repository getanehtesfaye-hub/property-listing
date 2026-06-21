const express = require('express');
const propertyController = require('../controllers/property.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { validatePropertyCreate } = require('../validators/property.validator');

const router = express.Router();

router.get('/', optionalAuth, propertyController.getProperties);
router.get('/:id', optionalAuth, propertyController.getPropertyById);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('OWNER', 'ADMIN'),
  validatePropertyCreate,
  propertyController.createProperty
);

router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware('OWNER', 'ADMIN'),
  propertyController.updateProperty
);

router.post(
  '/:id/publish',
  authMiddleware,
  roleMiddleware('OWNER'),
  propertyController.publishProperty
);

router.post(
  '/:id/archive',
  authMiddleware,
  roleMiddleware('OWNER'),
  propertyController.archiveProperty
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('OWNER', 'ADMIN'),
  propertyController.deleteProperty
);

module.exports = router;
