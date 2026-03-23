"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

interface AuthContextType {
  user:    User | null;
  isAdmin: boolean;
  loading: boolean;
  login:   () => Promise<void>;
  logout:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, isAdmin: false, loading: true,
  login: async () => {}, logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const provider = new GoogleAuthProvider();

  async function checkAdmin(u: User) {
    try {
      const snap = await getDoc(doc(db, "config", "admins"));
      const emails: string[] = snap.exists() ? snap.data().emails : [];
      setIsAdmin(emails.includes(u.email ?? ""));
    } catch {
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await checkAdmin(u);
      else setIsAdmin(false);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function login() {
    const result = await signInWithPopup(auth, provider);
    await checkAdmin(result.user);
  }

  async function logout() {
    await signOut(auth);
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);