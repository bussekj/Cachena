const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/trackerController');
const jwtAuth = require('../middleware/authMiddleware');

router.get('/', trackerController.test);
router.get('/id', trackerController.getById);

router.post('/register', trackerController.register);
router.post('/update', trackerController.update);
router.post('/assign', trackerController.assign);


module.exports = router;
