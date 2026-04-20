'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      const mockToken = typeof window !== 'undefined' ? localStorage.getItem('wwm_token') : null;
      if (mockToken && mockToken.startsWith('mock-token-')) {
        const uid = mockToken.replace('mock-token-', '');
        setUser({ uid, email: `mockuser_${uid}@example.com` });
        api.auth.me()
          .then(({ user: p }) => setProfile(p))
          .catch(() => setProfile(null))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
      return;
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setProfile(null);
        if (typeof window !== 'undefined') localStorage.removeItem('wwm_token');
        setLoading(false);
        return;
      }
      const token = await fbUser.getIdToken();
      if (typeof window !== 'undefined') localStorage.setItem('wwm_token', token);
      setUser(fbUser);

      try {
        const { user: p } = await api.auth.me();
        setProfile(p);
      } catch {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = async (email, password) => {
    if (!auth) {
      const mockUid = email.split('@')[0] || 'mockuser';
      const mockToken = `mock-token-${mockUid}`;
      if (typeof window !== 'undefined') localStorage.setItem('wwm_token', mockToken);
      setUser({ uid: mockUid, email });
      await refreshProfile();
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password) => {
    if (!auth) {
      const mockUid = email.split('@')[0] || 'mockuser';
      const mockToken = `mock-token-${mockUid}`;
      if (typeof window !== 'undefined') localStorage.setItem('wwm_token', mockToken);
      setUser({ uid: mockUid, email });
      return;
    }
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (!auth) {
      if (typeof window !== 'undefined') localStorage.removeItem('wwm_token');
      setUser(null);
      setProfile(null);
      return;
    }
    if (auth) await signOut(auth);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { user: p } = await api.auth.me();
    setProfile(p);
    return p;
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
