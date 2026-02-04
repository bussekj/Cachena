const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const jwtAuth = require('../middleware/authMiddleware');

router.get('/', tagController.test);
router.get('/id', tagController.getUser);
router.post('/delete', tagController.register);

module.exports = router;
