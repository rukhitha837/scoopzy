import { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  useEffect(() => {
    if (!tokenStore.get()) return;
    api.me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = ({ token, user }) => {
    tokenStore.set(token);
    setUser(user);
    return user;
  };

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'ADMIN',
    login: async (email, password) => handleAuth(await api.login({ email, password })),
    register: async (data) => handleAuth(await api.register(data)),
    logout: () => {
      tokenStore.clear();
      setUser(null);
    },
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
