import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from '../api/auth';

const AuthContext = createContext(null);

function getStoredMockUser() {
  if (localStorage.getItem('token') !== 'mock-token') return null;

  try {
    const user = JSON.parse(localStorage.getItem('mock-user') || 'null');
    if (user) return user;
  } catch {
    localStorage.removeItem('mock-user');
  }

  localStorage.removeItem('token');
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredMockUser);
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('token');
    return Boolean(token && token !== 'mock-token');
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'mock-token') return;

    let active = true;
    auth.me()
      .then((response) => {
        if (active) setUser(response.user || response);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('mock-user');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function login(credentials) {
    const response = await auth.login(credentials);
    if (response.token) localStorage.setItem('token', response.token);
    if (response.user) localStorage.setItem('mock-user', JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  }

  async function signup(details) {
    const response = await auth.signup(details);
    if (response.token) localStorage.setItem('token', response.token);
    if (response.user) localStorage.setItem('mock-user', JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('mock-user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, signup, logout, setUser }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
