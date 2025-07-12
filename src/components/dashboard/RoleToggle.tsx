
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDashboard } from "@/contexts/DashboardContext";
import { ShoppingBag, Store } from "lucide-react";

const RoleToggle = () => {
  const { activeRole, setActiveRole } = useDashboard();

  return (
    <div className="flex items-center justify-center space-x-2 bg-gray-50 rounded-lg py-2 px-3">
      <div
        className={`flex items-center space-x-2 rounded-lg p-2 transition-colors ${
          activeRole === "buyer" ? "bg-white shadow-sm" : ""
        }`}
      >
        <ShoppingBag
          className={`h-5 w-5 ${
            activeRole === "buyer" ? "text-auction-purple" : "text-gray-400"
          }`}
        />
        <Label
          htmlFor="role-toggle"
          className={`cursor-pointer ${
            activeRole === "buyer" ? "text-auction-purple font-medium" : "text-gray-500"
          }`}
        >
          Buyer
        </Label>
      </div>

      <Switch
        id="role-toggle"
        checked={activeRole === "seller"}
        onCheckedChange={(checked) => setActiveRole(checked ? "seller" : "buyer")}
        className="data-[state=checked]:bg-auction-purple"
      />

      <div
        className={`flex items-center space-x-2 rounded-lg p-2 transition-colors ${
          activeRole === "seller" ? "bg-white shadow-sm" : ""
        }`}
      >
        <Store
          className={`h-5 w-5 ${
            activeRole === "seller" ? "text-auction-purple" : "text-gray-400"
          }`}
        />
        <Label
          htmlFor="role-toggle"
          className={`cursor-pointer ${
            activeRole === "seller" ? "text-auction-purple font-medium" : "text-gray-500"
          }`}
        >
          Seller
        </Label>
      </div>
    </div>
  );
};

export default RoleToggle;
