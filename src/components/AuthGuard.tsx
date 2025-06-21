
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
    if (!loading && requireAuth && !user) {
      redirectToAuth(location.pathname);
    }
  }, [user, loading, requireAuth, location.pathname, redirectToAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};

export default AuthGuard;
