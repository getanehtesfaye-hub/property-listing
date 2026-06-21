const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware('OWNER', 'ADMIN'),
  upload.array('images', 5), // Accept up to 5 files with field name "images"
  uploadController.uploadImages
);

module.exports = router;
