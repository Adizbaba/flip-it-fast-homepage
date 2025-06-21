
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error checking authentication session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Handle post-login redirect
          const redirectPath = localStorage.getItem('redirectAfterAuth');
          if (redirectPath && redirectPath !== '/auth') {
            localStorage.removeItem('redirectAfterAuth');
            window.location.href = redirectPath;
          } else {
            // Default redirect to dashboard
            window.location.href = '/dashboard';
          }
        }
        
        if (event === 'SIGNED_OUT') {
          // Clear any stored redirect path
          localStorage.removeItem('redirectAfterAuth');
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const redirectToAuth = (currentPath?: string) => {
    if (currentPath && currentPath !== '/auth') {
      localStorage.setItem('redirectAfterAuth', currentPath);
    }
    window.location.href = '/auth';
  };

  return {
    user,
    session,
    loading,
    signOut,
    redirectToAuth,
  };
}
