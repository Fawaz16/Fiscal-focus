const transporter = require('../config/email');
const templates = require('../utils/templates/emailTemplates');
const server_url = process.env.NODE_ENV === 'production' ? process.env.FRONTEND_PROD_URL : process.env.FRONTEND_DEV_URL;

class EmailService {
  static async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `"Fiscal Focus" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  static async sendWelcomeEmail(user) {
    const html = await templates.welcome(user);
    return await this.sendEmail(
      user.email,
      '🎉 Welcome to Fiscal Focus!',
      html
    );
  }

  static async sendVerificationEmail(user, token) {
    const verificationUrl = `${server_url}/verify-email?token=${token}`;
    const html = await templates.verification(user, verificationUrl);
    return await this.sendEmail(
      user.email,
      '✅ Verify Your Email Address',
      html
    );
  }

  static async sendPasswordResetEmail(user, token) {
    const resetUrl = `${server_url}/reset-password?token=${token}`;
    const html = await templates.passwordReset(user, resetUrl);
    return await this.sendEmail(
      user.email,
      '🔒 Reset Your Password',
      html
    );
  }

  static async sendBudgetAlertEmail(user, category, budget) {
    const html = await templates.budgetAlert(user, category, budget);
    return await this.sendEmail(
      user.email,
      '⚠️ Budget Alert: Category Limit Reached',
      html
    );
  }

  static async sendWeeklySummaryEmail(user, summary) {
    const html = await templates.weeklySummary(user, summary);
    return await this.sendEmail(
      user.email,
      '📊 Your Weekly Financial Summary',
      html
    );
  }
}

module.exports = EmailService;