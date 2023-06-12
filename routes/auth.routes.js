const { Router } = require('express');
const router = Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.loginAdmin);
router.post('/register', authController.adminRegister);

module.exports = router;
