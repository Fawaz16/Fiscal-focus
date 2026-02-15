const express = require('express');
const router = express.Router();
const NotificationSettingsController = require('../controllers/notificationSettingsController');
const { auth } = require('../middleware/auth');

router.get('/settings/notifications', auth, NotificationSettingsController.getSettings);
router.put('/settings/notifications', auth, NotificationSettingsController.updateSettings);

module.exports = router;