
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ShieldCheck, Users, Box, Tag, Gavel, LineChart, Settings } from "lucide-react";
import AdminStats from "@/components/admin/AdminStats";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.rpc('is_admin', {
        user_id: user.id
      });

      if (error || !data) {
        navigate('/');
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <Sidebar className="hidden lg:block">
          <SidebarHeader className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6" />
              <div className="flex flex-col">
                <span className="text-lg font-semibold">Admin Panel</span>
                <span className="text-xs text-muted-foreground">Manage your platform</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <a href="/admin" className="flex items-center gap-3">
                    <LineChart className="h-4 w-4" />
                    Dashboard
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/users" className="flex items-center gap-3">
                    <Users className="h-4 w-4" />
                    Users
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/items" className="flex items-center gap-3">
                    <Box className="h-4 w-4" />
                    Items
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/categories" className="flex items-center gap-3">
                    <Tag className="h-4 w-4" />
                    Categories
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/disputes" className="flex items-center gap-3">
                    <Gavel className="h-4 w-4" />
                    Disputes
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/settings" className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col">
          <header className="flex h-14 lg:h-16 items-center gap-4 border-b bg-gray-100/40 px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Dashboard Overview</h1>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <AdminStats />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
