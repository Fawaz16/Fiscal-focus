const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.get('/dashboard', auth, UserController.getDashboard);
router.get('/summary/:period', auth, UserController.getFinancialSummary);

module.exports = router;