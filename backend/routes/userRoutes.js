const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const jwtAuth = require('../middleware/authMiddleware');

router.get('/', userController.test);
router.post('/postUser', userController.register);
router.post('/getUser', userController.getUser);

module.exports = router;
