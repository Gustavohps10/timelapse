import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (key: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    window.api.keytar.getPassword('atask', 'userKey').then((token) => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
    });
  }, []);
  
  const login = useCallback((key: string) => window.api.keytar.savePassword('atask', 'userKey', key).then(() => setIsAuthenticated(true)), []);

  const logout = useCallback(() => window.api.keytar.deletePassword('atask', 'userKey').then(() => setIsAuthenticated(false)), []);

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
};
