const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Balance endpoints
router.get('/', auth, UserController.getBalance);
router.get('/update', auth, UserController.getBalanceUpdate);
router.get('/forecast', auth, UserController.getBalanceForecast);
router.get('/categories', auth, UserController.getCategoryBreakdown);
router.get('/savings-progress', auth, UserController.getSavingsProgress);

module.exports = router;