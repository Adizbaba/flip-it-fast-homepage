
import PlaceholderPage from "@/components/dashboard/PlaceholderPage";
import ProfileManagement from "./ProfileManagement";
import SettingsPageComponent from "./SettingsPage";
import { Bell } from "lucide-react";

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
  return <ProfileManagement />;
};

export const SettingsPage = () => {
  return <SettingsPageComponent />;
};
