const express = require('express');
const router = express.Router();
const trackedUserObjectController = require('../controllers/trackedUserObjectController');
const jwtAuth = require('../middleware/authMiddleware');

// TODO: This is shit, missing query information!!
router.get('/', trackedUserObjectController.test);
router.get('/id', trackedUserObjectController.getById);
router.get('/user', trackedUserObjectController.getByUser);
// router.get('/user/tag/', trackedUserObjectController.getByUserAndTag);

router.post('/register', trackedUserObjectController.register);
router.post('/update', trackedUserObjectController.update);


module.exports = router;