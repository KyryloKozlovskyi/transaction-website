import React, { createContext, useState, useContext, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../../config/config";

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get ID token result to check custom claims
        const idTokenResult = await firebaseUser.getIdTokenResult();
        setIsAdmin(!!idTokenResult.claims.admin);
        setUser(firebaseUser);
      } else {
        setIsAdmin(false);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idTokenResult = await userCredential.user.getIdTokenResult();

      if (!idTokenResult.claims.admin) {
        await signOut(auth);
        throw new Error("Access denied. Admin privileges required.");
      }

      setIsAdmin(true);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AdminContext.Provider value={{ isAdmin, user, login, logout, getToken }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
