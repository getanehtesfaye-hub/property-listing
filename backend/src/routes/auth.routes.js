const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', authMiddleware, authController.me);

module.exports = router;