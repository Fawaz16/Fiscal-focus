// context/CurrencyContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext();

export const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState({
    code: 'USD',
    symbol: '$',
    name: 'US Dollar'
  });

  useEffect(() => {
    if (user?.currency) {
      const foundCurrency = currencies.find(c => c.code === user.currency) || currencies[0];
      setCurrency(foundCurrency);
    }
  }, [user]);

  const formatAmount = (amount) => {
    return `${currency.symbol}${Number(amount).toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      currencies,
      formatAmount,
      setCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};