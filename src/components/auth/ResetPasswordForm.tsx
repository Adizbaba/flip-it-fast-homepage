import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const ResetPasswordForm = () => {
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we have the necessary tokens for password reset
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [searchParams, navigate]);

  const validatePasswords = () => {
    const newErrors: Record<string, string> = {};

    try {
      passwordSchema.parse(passwords.new);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.new = error.errors[0].message;
      }
    }

    if (!passwords.confirm) {
      newErrors.confirm = "Please confirm your new password";
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated. You can now sign in with your new password.",
      });
      
      // Redirect to login page
      navigate('/auth');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Set new password</h3>
        <p className="text-sm text-gray-600 mt-2">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              id="new-password"
              type={showPasswords.new ? "text" : "password"}
              required
              className={`pl-10 pr-10 ${errors.new ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
              value={passwords.new}
              onChange={(e) => {
                setPasswords(prev => ({ ...prev, new: e.target.value }));
                if (errors.new) setErrors(prev => ({ ...prev, new: "" }));
              }}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => togglePasswordVisibility('new')}
              aria-label={showPasswords.new ? "Hide password" : "Show password"}
            >
              {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.new && (
            <p className="text-sm text-red-500">{errors.new}</p>
          )}
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              id="confirm-password"
              type={showPasswords.confirm ? "text" : "password"}
              required
              className={`pl-10 pr-10 ${errors.confirm ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
              value={passwords.confirm}
              onChange={(e) => {
                setPasswords(prev => ({ ...prev, confirm: e.target.value }));
                if (errors.confirm) setErrors(prev => ({ ...prev, confirm: "" }));
              }}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => togglePasswordVisibility('confirm')}
              aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
            >
              {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirm && (
            <p className="text-sm text-red-500">{errors.confirm}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Updating...
            </span>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;