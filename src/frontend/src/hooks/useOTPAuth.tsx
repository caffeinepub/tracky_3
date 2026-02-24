import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OTPAuthContextType {
  mobileNumber: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (mobileNumber: string) => void;
  clear: () => void;
}

const OTPAuthContext = createContext<OTPAuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'tracky_auth_mobile';

export function OTPAuthProvider({ children }: { children: ReactNode }) {
  const [mobileNumber, setMobileNumber] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const storedMobile = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedMobile) {
      setMobileNumber(storedMobile);
    }
    setIsInitializing(false);
  }, []);

  const login = (mobile: string) => {
    setMobileNumber(mobile);
    localStorage.setItem(AUTH_STORAGE_KEY, mobile);
  };

  const clear = () => {
    setMobileNumber(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value: OTPAuthContextType = {
    mobileNumber,
    isAuthenticated: !!mobileNumber,
    isInitializing,
    login,
    clear,
  };

  return <OTPAuthContext.Provider value={value}>{children}</OTPAuthContext.Provider>;
}

export function useOTPAuth() {
  const context = useContext(OTPAuthContext);
  if (context === undefined) {
    throw new Error('useOTPAuth must be used within an OTPAuthProvider');
  }
  return context;
}
