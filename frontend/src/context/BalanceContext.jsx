import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const BalanceContext = createContext({});

export const useBalance = () => useContext(BalanceContext);

export const BalanceProvider = ({ children }) => {
  const [currentBalance, setCurrentBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentBalance();
    
    // Poll for balance updates every 30 seconds
    const interval = setInterval(fetchCurrentBalance, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentBalance = async () => {
    try {
      const response = await api.get('/user/dashboard');
      if (response.data.success) {
        setCurrentBalance(response.data.data.overview?.currentBalance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = (amount, type) => {
    setCurrentBalance(prev => {
      if (type === 'income') {
        return (prev || 0) + amount;
      } else {
        return (prev || 0) - amount;
      }
    });
  };

  const getBalanceUpdate = async () => {
    try {
      const response = await api.get('/user/balance/balance');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error getting balance update:', error);
      return null;
    }
  };

  const getFinancialSummary = async (period) => {
    try {
      const response = await api.get(`/user/summary/${period}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error getting financial summary:', error);
      return null;
    }
  };

  const getCategoryBreakdown = async (startDate, endDate) => {
    try {
      const response = await api.get('/user/balance/categories', {
        params: { start_date: startDate, end_date: endDate }
      });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      return null;
    }
  };

  const getSavingsProgress = async () => {
    try {
      const response = await api.get('/user/balance/savings-progress');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error getting savings progress:', error);
      return null;
    }
  };

  const getBalanceForecast = async (days = 30) => {
    try {
      const response = await api.get('/user/balance/forecast', {
        params: { days }
      });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error getting balance forecast:', error);
      return null;
    }
  };

  const value = {
    currentBalance,
    loading,
    updateBalance,
    getBalanceUpdate,
    getFinancialSummary,
    getCategoryBreakdown,
    getSavingsProgress,
    getBalanceForecast,
    refreshBalance: fetchCurrentBalance,
  };

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
};