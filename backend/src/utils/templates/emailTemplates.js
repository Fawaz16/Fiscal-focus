const ejs = require('ejs');
const path = require('path');

const renderTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, `../../views/emails/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, data);
    return html;
  } catch (error) {
    console.error('Error rendering email template:', error);
    throw error;
  }
};

const templates = {
  welcome: async (user) => {
    return await renderTemplate('welcome', {
      user,
      appName: 'Fiscal Focus',
      year: new Date().getFullYear(),
    });
  },
  
  verification: async (user, verificationUrl) => {
    return await renderTemplate('verification', {
      user,
      verificationUrl,
      appName: 'Fiscal Focus',
      year: new Date().getFullYear(),
    });
  },
  
  passwordReset: async (user, resetUrl) => {
    return await renderTemplate('passwordReset', {
      user,
      resetUrl,
      appName: 'Fiscal Focus',
      year: new Date().getFullYear(),
    });
  },
  
  budgetAlert: async (user, category, budget) => {
    return await renderTemplate('budgetAlert', {
      user,
      category,
      budget,
      appName: 'Fiscal Focus',
      year: new Date().getFullYear(),
    });
  },
  
  weeklySummary: async (user, summary) => {
    return await renderTemplate('weeklySummary', {
      user,
      summary,
      appName: 'Fiscal Focus',
      year: new Date().getFullYear(),
    });
  },
};

module.exports = templates;