const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

router.get(
  '/metrics',
  authMiddleware,
  roleMiddleware('ADMIN'),
  adminController.getMetrics
);

router.patch(
  '/properties/:id/disable',
  authMiddleware,
  roleMiddleware('ADMIN'),
  adminController.disableProperty
);
router.patch(
  '/properties/:id/enable',
  authMiddleware,
  roleMiddleware('ADMIN'),
  adminController.enableProperty
);

module.exports = router;
