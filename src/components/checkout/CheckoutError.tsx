
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CheckoutError = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="text-lg font-medium">Item not found</p>
      <Button onClick={() => navigate("/")}>Return to Home</Button>
    </div>
  );
};

export default CheckoutError;
