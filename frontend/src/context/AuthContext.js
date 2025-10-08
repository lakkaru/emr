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

  // Install a light global fetch wrapper to dispatch an event on 401 responses.
  useEffect(() => {
    if (!window || !window.fetch) return undefined;
    const originalFetch = window.fetch.bind(window);
    const wrapped = async (...args) => {
      const res = await originalFetch(...args);
      if (res.status === 401) {
        try {
          const detail = await res.json().catch(() => ({}));
          window.dispatchEvent(new CustomEvent('api:unauthorized', { detail }));
        } catch (e) {
          window.dispatchEvent(new CustomEvent('api:unauthorized', { detail: {} }));
        }
      }
      return res;
    };
    window.fetch = wrapped;
    return () => {
      window.fetch = originalFetch;
    };
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

  // Listen for global unauthorized events and logout the user
  useEffect(() => {
    const onUnauthorized = (e) => {
      console.warn('API returned 401, logging out user');
      logout();
      // Optionally show a friendly message
      try { window.alert('Session expired or unauthorized. You have been logged out. Please login again.'); } catch (e) {}
    };
    window.addEventListener('api:unauthorized', onUnauthorized);
    return () => window.removeEventListener('api:unauthorized', onUnauthorized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto logout on inactivity. Make timeout configurable via GATSBY_INACTIVITY_MINUTES (minutes).
  // Set to 0 to disable auto-logout.
  useEffect(() => {
    const envVal = parseInt(process.env.GATSBY_INACTIVITY_MINUTES, 10);
    const minutes = Number.isFinite(envVal) && envVal >= 0 ? envVal : 15; // default 15 minutes

    if (minutes === 0) {
      // Auto-logout disabled
      return undefined;
    }

    const INACTIVITY_MS = minutes * 60 * 1000;
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
