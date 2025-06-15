
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Palette, 
  Shield, 
  Globe
} from "lucide-react";
import ThemeToggle from "@/components/dashboard/settings/ThemeToggle";
import NotificationSettings from "@/components/dashboard/settings/NotificationSettings";
import PrivacySettings from "@/components/dashboard/settings/PrivacySettings";
import AppearanceSettings from "@/components/dashboard/settings/AppearanceSettings";
import GeneralSettings from "@/components/dashboard/settings/GeneralSettings";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const SettingsPageComponent = () => {
  const { preferences, loading, updatePreference } = useUserPreferences();

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
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacySettings
            preferences={preferences}
            onUpdate={updatePreference}
          />
        </TabsContent>

        <TabsContent value="general">
          <GeneralSettings
            preferences={preferences}
            onUpdate={updatePreference}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPageComponent;
