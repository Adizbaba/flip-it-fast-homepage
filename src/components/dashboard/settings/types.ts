
export interface UserPreferences {
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
