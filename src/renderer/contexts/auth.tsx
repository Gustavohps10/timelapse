import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { User } from '../@types/User';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (key: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    window.api.keytar.getPassword('atask', 'userKey').then((key) => {
      if (!key) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      window.api.redmine.currentUser({ key }).then((currentUserData) => {
        setIsAuthenticated(true);
        setUser(currentUserData.user);
      }).catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      });
    });
  }, []);

  const login = useCallback((key: string) => {
    window.api.keytar.deletePassword('atask', 'userKey').then(() => {
      setIsAuthenticated(false);
      setUser(null);
    });
    
    window.api.keytar.savePassword('atask', 'userKey', key).then(() => {
      window.api.redmine.currentUser({ key }).then((currentUserData) => {
        setIsAuthenticated(true);
        setUser(currentUserData.user); 
      }).catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      });
    });
  }, []);

  const logout = useCallback(() => {
    window.api.keytar.deletePassword('atask', 'userKey').then(() => {
      setIsAuthenticated(false);
      setUser(null);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
