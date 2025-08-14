import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Mail, Key, User, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

// Validation schemas
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");
const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces");

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
  }>({});
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check URL params to determine mode
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode');
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [showForgotPassword, setShowForgotPassword] = useState(mode === 'forgot-password');
  const [showResetPassword, setShowResetPassword] = useState(mode === 'reset-password');

  // Update mode when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    setIsSignUp(mode === 'signup');
    setShowForgotPassword(mode === 'forgot-password');
    setShowResetPassword(mode === 'reset-password');
  }, [location.search]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
      }
    }

    if (isSignUp) {
      try {
        nameSchema.parse(fullName);
      } catch (error) {
        if (error instanceof z.ZodError) {
          newErrors.fullName = error.errors[0].message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: redirectUrl
          },
        });
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Redirect will be handled by the auth state change listener
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleMode = () => {
    const newMode = !isSignUp;
    setIsSignUp(newMode);
    setErrors({});
    setShowPassword(false);
    setShowForgotPassword(false);
    setShowResetPassword(false);
    // Update URL to reflect the current mode
    const searchParams = new URLSearchParams();
    if (newMode) {
      searchParams.set('mode', 'signup');
    }
    navigate(`/auth${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, { replace: true });
  };

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setIsSignUp(false);
    setShowResetPassword(false);
    navigate('/auth?mode=forgot-password', { replace: true });
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setIsSignUp(false);
    setShowResetPassword(false);
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {showForgotPassword ? (
              <ForgotPasswordForm onBackToLogin={handleBackToLogin} />
            ) : showResetPassword ? (
              <ResetPasswordForm />
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {isSignUp ? "Create your account" : "Sign in to your account"}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    <button
                      onClick={handleToggleMode}
                      className="font-medium text-auction-purple hover:text-auction-magenta transition-colors"
                    >
                      {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                  </p>
                </div>
            
            <form className="mt-6 space-y-5" onSubmit={handleAuth}>
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      required
                      className={`pl-10 ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) {
                          setErrors({ ...errors, fullName: undefined });
                        }
                      }}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    className={`pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors({ ...errors, email: undefined });
                      }
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors({ ...errors, password: undefined });
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                {isSignUp && (
                  <div className="text-sm text-gray-500 mt-1 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter</li>
                      <li>One lowercase letter</li>
                      <li>One number</li>
                      <li>One special character</li>
                    </ul>
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full py-2.5 mt-4 bg-auction-purple hover:bg-auction-magenta transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isSignUp ? "Sign up" : "Sign in"
                )}
              </Button>
            </form>
            
            {!isSignUp && (
              <div className="text-center">
                <button
                  onClick={handleShowForgotPassword}
                  className="text-sm text-auction-purple hover:text-auction-magenta transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
