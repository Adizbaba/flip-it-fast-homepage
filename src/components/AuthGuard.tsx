
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = false }: AuthGuardProps) => {
  const { user, loading, redirectToAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if we're not loading and auth is required but user is not present
    if (!loading && requireAuth && !user && location.pathname !== '/auth') {
      redirectToAuth(location.pathname);
    }
  }, [user, loading, requireAuth, location.pathname, redirectToAuth]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-primary"></div>
      </div>
    );
  }

  // If auth is required but user is not logged in, don't render anything (will redirect)
  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
