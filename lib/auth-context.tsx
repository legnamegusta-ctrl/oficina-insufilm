// src/lib/auth-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth';
import { ensureUserDoc } from '@/lib/user-service';

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return; // evita rodar no server
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u ?? null);
      setLoading(false);
      if (u) await ensureUserDoc({ uid: u.uid, email: u.email });
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    user,
    loading,
    async signIn(email, password) {
      if (!auth) return;
      await signInWithEmailAndPassword(auth, email, password);
    },
    async signUp(email, password) {
      if (!auth) return;
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserDoc({ uid: cred.user.uid, email: cred.user.email });
    },
    async signOutUser() {
      if (!auth) return;
      await signOut(auth);
    }
  }), [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
