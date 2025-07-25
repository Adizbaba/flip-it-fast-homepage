
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardNav from "./DashboardNav";
import RoleToggle from "./RoleToggle";
import { DashboardProvider } from "@/contexts/DashboardContext";

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("You must be logged in to access the dashboard");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-auction-purple"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initialLetter = user.email ? user.email[0].toUpperCase() : "U";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <DashboardProvider>
        <SidebarProvider defaultOpen={true}>
          <div className="flex flex-1 w-full bg-gray-50">
            <Sidebar side="left" className="border-r bg-white">
              <SidebarHeader className="border-b p-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-auction-purple text-white">
                      {initialLetter}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <RoleToggle />
              </SidebarHeader>
              <SidebarContent>
                <DashboardNav />
              </SidebarContent>
              <SidebarFooter>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          className="w-full justify-start"
                          onClick={() => {
                            navigate("/");
                          }}
                        >
                          <span>Back to Site</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset className="w-full">
              <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
                  <SidebarTrigger className="md:hidden" />
                  <h1 className="text-lg font-semibold">Dashboard</h1>
                </div>
                <main className="flex-1 bg-gray-50 p-4 overflow-auto">
                  <div className="container mx-auto py-6">
                    <Outlet />
                  </div>
                </main>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </DashboardProvider>
      
      <Footer />
    </div>
  );
};

export default DashboardLayout;
