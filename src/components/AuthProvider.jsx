import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage immediately - synchronous, no loading state
  const [session, setSession] = useState(() => {
    try {
      const authToken = localStorage.getItem(`sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'default'}-auth-token`);
      return authToken ? JSON.parse(authToken)?.session : null;
    } catch {
      return null;
    }
  });

  // Keep in sync with Supabase in background
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
