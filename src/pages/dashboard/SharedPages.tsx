
import PlaceholderPage from "@/components/dashboard/PlaceholderPage";
import { Bell, UserRound, Settings } from "lucide-react";

export const NotificationsPage = () => {
  return (
    <PlaceholderPage
      title="Notifications"
      description="Stay updated with your account activity"
      icon={<Bell className="h-6 w-6" />}
    />
  );
};

export const ProfilePage = () => {
  return (
    <PlaceholderPage
      title="Profile"
      description="Manage your personal information"
      icon={<UserRound className="h-6 w-6" />}
    />
  );
};

export const SettingsPage = () => {
  return (
    <PlaceholderPage
      title="Settings"
      description="Configure your account preferences"
      icon={<Settings className="h-6 w-6" />}
    />
  );
};
