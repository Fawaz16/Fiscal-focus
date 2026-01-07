const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Balance endpoints
router.get('/balance', auth, UserController.getBalance);
router.get('/balance/update', auth, UserController.getBalanceUpdate);
router.get('/balance/forecast', auth, UserController.getBalanceForecast);
router.get('/balance/categories', auth, UserController.getCategoryBreakdown);
router.get('/balance/savings-progress', auth, UserController.getSavingsProgress);

module.exports = router;