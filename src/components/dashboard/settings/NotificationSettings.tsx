import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Gavel, Heart, MessageSquare } from "lucide-react";
import { UserPreferences } from "./types";

interface NotificationSettingsProps {
  preferences: UserPreferences;
  onUpdate: (key: keyof UserPreferences, value: any) => void;
}

const NotificationSettings = ({ preferences, onUpdate }: NotificationSettingsProps) => {
  const notificationTypes = [
    {
      key: 'email_notifications',
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive general email notifications',
    },
    {
      key: 'bid_notifications',
      icon: Gavel,
      title: 'New Bid Notifications',
      description: 'Get notified when someone bids on your listings',
    },
    {
      key: 'outbid_notifications',
      icon: Bell,
      title: 'Outbid Alerts',
      description: 'Get notified when you\'re outbid on an auction',
    },
    {
      key: 'auction_won_notifications',
      icon: Heart,
      title: 'Auction Won',
      description: 'Get notified when you win an auction',
    },
    {
      key: 'message_notifications',
      icon: MessageSquare,
      title: 'New Messages',
      description: 'Get notified about new messages from other users',
    },
    {
      key: 'marketing_emails',
      icon: Mail,
      title: 'Marketing Emails',
      description: 'Receive promotional emails and updates',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose what notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationTypes.map((notification, index) => (
          <div key={notification.key}>
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <notification.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <Label 
                    htmlFor={notification.key}
                    className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {notification.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
              </div>
              <Switch
                id={notification.key}
                checked={preferences[notification.key as keyof UserPreferences] as boolean}
                onCheckedChange={(checked) => onUpdate(notification.key as keyof UserPreferences, checked)}
              />
            </div>
            {index < notificationTypes.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
