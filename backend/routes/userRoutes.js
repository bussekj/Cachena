const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const jwtAuth = require('../middleware/authMiddleware');

router.get('/', userController.test);
router.post('/register', userController.register);
// router.post('/login', userController.login);

// // Protected routes
// router.get('/fetchAll', jwtAuth, userController.fetchAll);
// router.delete('/deleteAll', jwtAuth, userController.deleteAll);
// router.get('/fetchAll', userController.fetchAll);
// router.post('/fetchByName', userController.fetchByName);
// router.post('/update', userController.update);
// router.post('/createCreditCard', userController.createCreditCard);

module.exports = router;
