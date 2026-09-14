import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  canExecuteAction: (actionRole: UserRole[]) => boolean;
}

const defaultUser: User = {
  id: 'user-admin',
  email: 'admin@nexora.io',
  name: 'Elena Rostova (SOC Lead)',
  role: 'SUPER_ADMIN',
  orgId: 'org-nexora-prod'
};

const AuthContext = createContext<AuthContextType>({
  currentUser: defaultUser,
  users: [defaultUser],
  switchUser: () => {},
  canExecuteAction: () => true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([defaultUser]);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  useEffect(() => {
    ApiService.getUsers()
      .then(u => {
        if (u && u.length > 0) {
          setUsers(u);
          setCurrentUser(u[0]);
        }
      })
      .catch(() => {});
  }, []);

  const switchUser = (userId: string) => {
    const matched = users.find(u => u.id === userId);
    if (matched) setCurrentUser(matched);
  };

  const canExecuteAction = (allowedRoles: UserRole[]): boolean => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, switchUser, canExecuteAction }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
