export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const getTimeRemaining = (endDate: string) => {
  const now = new Date();
  const end = new Date(endDate);
  const timeLeft = end.getTime() - now.getTime();
  
  if (timeLeft <= 0) return "Ended";
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const getItemImage = (images: any): string => {
  if (!images) return "/placeholder.svg";
  
  try {
    if (Array.isArray(images) && images.length > 0) {
      return typeof images[0] === 'string' ? images[0] : "/placeholder.svg";
    }
    
    if (typeof images === 'string') {
      return images;
    }
    
    if (typeof images === 'object' && images !== null && 'url' in images) {
      return String(images.url);
    }
  } catch (e) {
    console.error("Error processing image:", e);
  }
  
  return "/placeholder.svg";
};

export const isNewListing = (createdAt: string) => {
  const now = new Date();
  const created = new Date(createdAt);
  const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7; // Items created within 7 days are considered "New"
};