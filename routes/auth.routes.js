const { Router } = require('express');
const router = Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.loginAdmin);
router.post('/register', authController.adminRegister);
router.post('/forgot-password-check', authController.forgotPasswordCheck);
router.post('/check-user', authController.checkUser);
router.post('/confirm-email', authController.confirmEmail);
router.get('/user-email', authController.getUserEmail);
router.post('/create-password', authController.createNewPassword);

module.exports = router;
