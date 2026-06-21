const express = require('express');
const { sendMessage, getOwnerMessages, deleteMessage } =
  require('../controllers/message.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, sendMessage);
router.get('/owner', authMiddleware, getOwnerMessages);
router.delete('/:id', authMiddleware, deleteMessage);

module.exports = router;