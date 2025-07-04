import { AuthContext } from '@/contexts/AuthContext';
import React from 'react';

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
