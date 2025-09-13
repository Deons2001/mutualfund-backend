const router = require('express').Router();
const { list, nav, history } = require('../controllers/fundController');

router.get('/', list);                        // List all funds
router.get('/:schemeCode/nav', nav);          // Latest NAV
router.get('/history/:schemeCode', history);  // NAV history

module.exports = router;
