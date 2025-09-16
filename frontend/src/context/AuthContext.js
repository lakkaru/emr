import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [idleTimer, setIdleTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const t = window.localStorage.getItem('auth_token');
      const u = window.localStorage.getItem('auth_user');
      if (t) setToken(t);
      if (u) {
        try {
          setUser(JSON.parse(u));
        } catch (e) {
          console.error('Error parsing user data:', e);
          window.localStorage.removeItem('auth_user');
        }
      }
    } catch (e) {
      console.error('Error loading auth data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (t, u) => {
    setToken(t);
    setUser(u);
    window.localStorage.setItem('auth_token', t);
    window.localStorage.setItem('auth_user', JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem('auth_token');
    window.localStorage.removeItem('auth_user');
  };

  // Auto logout on inactivity (e.g., 15 minutes)
  useEffect(() => {
    const INACTIVITY_MS = 15 * 60 * 1000;
    const reset = () => {
      if (idleTimer) clearTimeout(idleTimer);
      setIdleTimer(setTimeout(() => {
        if (token) logout();
      }, INACTIVITY_MS));
    };
    const events = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, reset));
    reset();
    return () => {
      events.forEach(evt => window.removeEventListener(evt, reset));
      if (idleTimer) clearTimeout(idleTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo(() => ({ token, user, login, logout, isLoading }), [token, user, isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
