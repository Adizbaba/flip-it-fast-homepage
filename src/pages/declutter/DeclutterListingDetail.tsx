
// Add this function to safely access the username
const getSellerUsername = (profiles: any): string => {
  if (!profiles) return "Unknown seller";
  if (typeof profiles === 'object' && 'username' in profiles) {
    return profiles.username || "Unknown seller";
  }
  return "Unknown seller";
};

// Use this function where needed in the component, replacing:
// seller_name: item.profiles && typeof item.profiles === 'object' ? 
//    (item.profiles as { username: string })?.username || "Unknown seller" : "Unknown seller"
// with:
// seller_name: getSellerUsername(item.profiles)
