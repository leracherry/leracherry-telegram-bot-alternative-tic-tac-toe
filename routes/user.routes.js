const { Router } = require('express');
const router = Router();
const userController = require('../controllers/user.controller');
const adminMiddleware = require('../middleware/auth.middleware');

router.get('/', adminMiddleware, userController.getProfile);
router.get('/list', adminMiddleware, userController.getUsersList);
router.put('/change-password', adminMiddleware, userController.changePassword);
router.put('/change-status', adminMiddleware, userController.changeStatus);
router.delete('/list', adminMiddleware, userController.deleteMany);

module.exports = router;
