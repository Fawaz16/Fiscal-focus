const { User } = require('../models/index');

class NotificationSettingsController {
  // Get notification settings
  static async getSettings(req, res, next) {
    try {
      const userId = req.user.id;
      
      const user = await User.findByPk(userId, {
        attributes: ['settings']
      });

      // Default notification settings
      const defaultSettings = {
        emailNotifications: true,
        pushNotifications: true,
        budgetAlerts: true,
        weeklySummary: true,
        monthlyReport: true,
        transactionAlerts: true,
        lowBalanceAlert: true,
        securityAlerts: true,
        budgetThreshold: 80,
        alertFrequency: 'immediate'
      };

      // Extract notification settings from user settings or use defaults
      const notificationSettings = user.settings?.notificationPreferences || defaultSettings;

      res.json({
        success: true,
        data: {
          settings: notificationSettings
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update notification settings
  static async updateSettings(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        emailNotifications,
        pushNotifications,
        budgetAlerts,
        weeklySummary,
        monthlyReport,
        transactionAlerts,
        lowBalanceAlert,
        securityAlerts,
        budgetThreshold,
        alertFrequency
      } = req.body;

      const user = await User.findByPk(userId);
      
      // Get current settings or initialize empty object
      const currentSettings = user.settings || {};
      
      // Update notification preferences
      const updatedSettings = {
        ...currentSettings,
        notificationPreferences: {
          emailNotifications: emailNotifications ?? true,
          pushNotifications: pushNotifications ?? true,
          budgetAlerts: budgetAlerts ?? true,
          weeklySummary: weeklySummary ?? true,
          monthlyReport: monthlyReport ?? true,
          transactionAlerts: transactionAlerts ?? true,
          lowBalanceAlert: lowBalanceAlert ?? true,
          securityAlerts: securityAlerts ?? true,
          budgetThreshold: budgetThreshold ?? 80,
          alertFrequency: alertFrequency ?? 'immediate'
        }
      };

      // Update user settings
      await user.update({ settings: updatedSettings });

      res.json({
        success: true,
        message: 'Notification settings updated successfully',
        data: {
          settings: updatedSettings.notificationPreferences
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationSettingsController;