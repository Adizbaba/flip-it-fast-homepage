import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Bell, 
  Palette, 
  Shield, 
  Globe, 
  Trash2,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import ThemeToggle from "@/components/dashboard/settings/ThemeToggle";
import NotificationSettings from "@/components/dashboard/settings/NotificationSettings";
import PrivacySettings from "@/components/dashboard/settings/PrivacySettings";
import AccountDeletionDialog from "@/components/dashboard/settings/AccountDeletionDialog";

interface UserPreferences {
  email_notifications: boolean;
  bid_notifications: boolean;
  outbid_notifications: boolean;
  auction_won_notifications: boolean;
  message_notifications: boolean;
  marketing_emails: boolean;
  profile_visibility: 'public' | 'private';
  show_email: boolean;
  show_full_name: boolean;
  preferred_language: string;
  preferred_currency: string;
}

const SettingsPage = () => {
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
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      const { data: profile } = await supabase
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

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-auction-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500">Manage your account preferences and settings</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationSettings
            preferences={preferences}
            onUpdate={updatePreference}
          />
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose between light and dark mode
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacySettings
            preferences={preferences}
            onUpdate={updatePreference}
          />
        </TabsContent>

        <TabsContent value="general">
          <div className="space-y-6">
            {/* Language & Currency */}
            <Card>
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>
                  Set your preferred language and currency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={preferences.preferred_language}
                      onValueChange={(value) => updatePreference('preferred_language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={preferences.preferred_currency}
                      onValueChange={(value) => updatePreference('preferred_currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AccountDeletionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
};

export default SettingsPage;
