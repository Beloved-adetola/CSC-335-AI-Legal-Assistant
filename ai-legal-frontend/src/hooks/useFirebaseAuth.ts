import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Auth } from "@/config/firebase";

interface FirebaseAuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useFirebaseAuth = (): FirebaseAuthState => {
  const [user, setUser] = useState<User | null>(() => Auth.currentUser);
  const [loading, setLoading] = useState<boolean>(() => !Auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(Auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
};


