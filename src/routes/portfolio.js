
const router = require('express').Router();
const auth = require('../middlewares/auth');
const portfolioController = require('../controllers/portfolioController');


router.post('/add', auth, portfolioController.add);
router.get('/list', auth, portfolioController.list);
router.get('/value', auth, portfolioController.value);

module.exports = router;
