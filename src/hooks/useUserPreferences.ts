
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPreferences } from "@/components/dashboard/settings/types";

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    bid_notifications: true,
    outbid_notifications: true,
    auction_won_notifications: true,
    message_notifications: true,
    marketing_emails: false,
    profile_visibility: 'public',
    show_email: false,
    show_full_name: true,
    preferred_language: 'en',
    preferred_currency: 'USD',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPreferences();
    }
  }, [user]);

  const fetchUserPreferences = async () => {
    try {
      // In a real app, you would fetch from a user_preferences table
      // For now, we'll use localStorage and profile data
      const savedPrefs = localStorage.getItem(`user_preferences_${user?.id}`);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }

      // Also fetch profile visibility from profiles table
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('profile_visibility')
        .eq('id', user?.id)
        .single();

      if (profile) {
        const visibility = profile.profile_visibility as 'public' | 'private';
        setPreferences(prev => ({
          ...prev,
          profile_visibility: visibility || 'public'
        }));
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    // Save to localStorage
    localStorage.setItem(`user_preferences_${user?.id}`, JSON.stringify(newPreferences));

    // Update profile visibility in database
    if (key === 'profile_visibility') {
      try {
        await supabase
          .from('profiles')
          .update({ profile_visibility: value })
          .eq('id', user?.id);
      } catch (error) {
        console.error("Error updating profile visibility:", error);
      }
    }

    toast.success("Settings updated");
  };

  return {
    preferences,
    loading,
    updatePreference
  };
};
