// src/components/email/EmailTemplates.jsx
import React from 'react';

const EmailTemplates = () => {
  const templates = {
    welcome: {
      subject: 'Welcome to Fiscal Focus!',
      preview: 'Get started with managing your finances effectively',
    },
    verification: {
      subject: 'Verify your email address',
      preview: 'Click the link to verify your Fiscal Focus account',
    },
    passwordReset: {
      subject: 'Reset your password',
      preview: 'Click the link to reset your Fiscal Focus password',
    },
    budgetAlert: {
      subject: 'Budget Alert',
      preview: 'You\'ve reached 80% of your budget limit',
    },
    weeklySummary: {
      subject: 'Your Weekly Financial Summary',
      preview: 'See how you spent your money this week',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Templates</h2>
        <p className="text-gray-600">
          These email templates are automatically sent to users based on their actions and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(templates).map(([key, template]) => (
          <div key={key} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">{template.subject}</h3>
                <p className="text-sm text-gray-500 mt-1">{template.preview}</p>
              </div>
              <span className="badge badge-info capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            </div>
            <div className="border-t pt-4">
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Preview template →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-medium text-blue-900 mb-2">Email Configuration</h3>
        <p className="text-blue-700 text-sm mb-4">
          All emails are sent from <strong>noreply@fiscalfocus.com</strong> and include unsubscribe links.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-600">SMTP Server:</span>
            <p className="text-blue-900">smtp.gmail.com</p>
          </div>
          <div>
            <span className="text-blue-600">Delivery Rate:</span>
            <p className="text-blue-900">99.2%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplates;