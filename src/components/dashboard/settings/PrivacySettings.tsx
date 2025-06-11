
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, EyeOff, Mail, User } from "lucide-react";
import { UserPreferences } from "./types";

interface PrivacySettingsProps {
  preferences: UserPreferences;
  onUpdate: (key: keyof UserPreferences, value: any) => void;
}

const PrivacySettings = ({ preferences, onUpdate }: PrivacySettingsProps) => {
  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select
              value={preferences.profile_visibility}
              onValueChange={(value) => onUpdate('profile_visibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Public - Anyone can view your profile
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Private - Only you can view your profile
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Visible Information</h4>
            <p className="text-sm text-muted-foreground">
              Choose what information is visible to other users when your profile is public
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="show_full_name">Show Full Name</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your full name on your public profile
                    </p>
                  </div>
                </div>
                <Switch
                  id="show_full_name"
                  checked={preferences.show_full_name}
                  onCheckedChange={(checked) => onUpdate('show_full_name', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="show_email">Show Email Address</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your email address on your public profile
                    </p>
                  </div>
                </div>
                <Switch
                  id="show_email"
                  checked={preferences.show_email}
                  onCheckedChange={(checked) => onUpdate('show_email', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettings;
