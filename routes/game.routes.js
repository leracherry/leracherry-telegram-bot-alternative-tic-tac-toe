const { Router } = require('express');
const router = Router();
const gameController = require('../controllers/game.controller');
const adminMiddleware = require('../middleware/auth.middleware');

router.get('/', adminMiddleware, gameController.getListGames);
router.delete('/list', adminMiddleware, gameController.deleteMany);

module.exports = router;
