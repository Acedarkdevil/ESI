import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, setAuthToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('esi_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setAuthToken(token);
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (error) {
        setAuthToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const login = (newToken, nextUser) => {
    setAuthToken(newToken);
    setToken(newToken);
    setUser(nextUser);
  };

  const logout = () => {
    setAuthToken('');
    setToken('');
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
