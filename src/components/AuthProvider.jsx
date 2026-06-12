import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

/**
 * Sync OAuth provider's avatar and name to profiles table.
 * Runs silently in the background after OAuth login.
 */
async function syncOAuthProfile(session) {
  try {
    const provider = session.user.app_metadata?.provider;
    if (!provider || !['google', 'github'].includes(provider)) return;

    const meta = session.user.user_metadata || {};
    const avatarUrl = meta.avatar_url || meta.picture || '';
    const fullName = meta.full_name || meta.name || '';

    if (!avatarUrl && !fullName) return;

    // Fetch current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url, name')
      .eq('id', session.user.id)
      .single();

    // Only update if fields are empty (first-time OAuth user)
    const needsUpdate = !profile?.avatar_url || !profile?.name;
    if (!needsUpdate) return;

    const updates = {
      id: session.user.id,
      avatar_url: profile?.avatar_url || avatarUrl || null,
      name: profile?.name || fullName || null,
    };

    await supabase
      .from('profiles')
      .upsert(updates, { onConflict: 'id' });

    // Process referral for first-time OAuth users
    const refCode = localStorage.getItem('collabfind_ref');
    if (refCode) {
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', refCode)
        .single();

      if (referrer && referrer.id !== session.user.id) {
        const { error } = await supabase.from('referrals').insert({
          referrer_id: referrer.id,
          referred_id: session.user.id,
        });
        if (error) console.warn('OAuth referral insert failed:', error.message);
      }
      localStorage.removeItem('collabfind_ref');
    }
  } catch (err) {
    console.error('OAuth profile sync error:', err);
  }
}

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
      if (data.session) {
        setSession(data.session);
        syncOAuthProfile(data.session);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) syncOAuthProfile(session);
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
