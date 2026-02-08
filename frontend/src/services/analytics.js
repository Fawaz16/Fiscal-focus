import api from './api';

export const analyticsService = {
  // Get financial summary for a period
  async getFinancialSummary(period) {
    try {
      const response = await api.get(`/user/summary/${period}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  },

  // Get category breakdown for a date range
  async getCategoryBreakdown(startDate, endDate) {
    try {
      const response = await api.get('/user/balance/categories', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      throw error;
    }
  },

  // Get balance forecast
  async getBalanceForecast(days = 30) {
    try {
      const response = await api.get('/user/balance/forecast', {
        params: { days }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching balance forecast:', error);
      throw error;
    }
  },

  // Get transaction stats for period
  async getTransactionStats(period) {
    try {
      const response = await api.get(`/transactions/stats/${period}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  },

  // Get category stats
  async getCategoryStats(period) {
    try {
      const response = await api.get(`/categories/stats/${period}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  },

  // Get savings progress
  async getSavingsProgress() {
    try {
      const response = await api.get('/user/balance/savings-progress');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching savings progress:', error);
      throw error;
    }
  },

  // Get dashboard overview
  async getDashboardOverview() {
    try {
      const response = await api.get('/user/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  },

  // Export analytics report
  async exportReport(startDate, endDate, format = 'json') {
    try {
      const response = await api.get('/user/analytics/export', {
        params: { start_date: startDate, end_date: endDate, format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        // Create download link for CSV
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `financial-report-${startDate}-${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { success: true };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },

  // Get monthly trend data
  async getMonthlyTrend() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 5); // Last 6 months
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      // Get daily data for the last 6 months
      const response = await api.get('/transactions/stats/month');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
      throw error;
    }
  }
};