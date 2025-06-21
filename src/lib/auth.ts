
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Check active sessions and sets the user
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
        }
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Error checking authentication session:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    checkUser();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle redirects only once and avoid loops
        if (event === 'SIGNED_IN' && session?.user && !hasRedirected) {
          setHasRedirected(true);
          
          // Use setTimeout to avoid redirect loops and ensure state is updated
          setTimeout(() => {
            const redirectPath = localStorage.getItem('redirectAfterAuth');
            if (redirectPath && redirectPath !== '/auth') {
              localStorage.removeItem('redirectAfterAuth');
              navigate(redirectPath, { replace: true });
            } else {
              // Default redirect to dashboard
              navigate('/dashboard', { replace: true });
            }
          }, 100);
        }
        
        if (event === 'SIGNED_OUT') {
          // Clear any stored redirect path and reset redirect flag
          localStorage.removeItem('redirectAfterAuth');
          setHasRedirected(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, hasRedirected]);

  const signOut = async () => {
    try {
      setHasRedirected(false);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const redirectToAuth = (currentPath?: string) => {
    if (currentPath && currentPath !== '/auth') {
      localStorage.setItem('redirectAfterAuth', currentPath);
    }
    navigate('/auth', { replace: true });
  };

  return {
    user,
    session,
    loading,
    signOut,
    redirectToAuth,
  };
}
