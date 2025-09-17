
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Department } from "@/api/entities";
import { Employee } from "@/api/entities";
import { LabTestCatalog } from "@/api/entities";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  FlaskConical,
  Pill,
  Receipt,
  Bed,
  Package,
  Settings,
  Bell,
  Search,
  Menu,
  LogOut,
  Heart,
  Activity,
  Building2,
  Stethoscope,
  Scissors,
  UserCog,
  UserCheck,
  ClipboardEdit,
  BookText,
  HeartPulse,
  FlaskConical as LabIcon,
  Landmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("User not authenticated or error loading user:", error);
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  // Simple navigation items - no complex logic
  const navigationItems = [
    {
      title: "Dashboard",
      url: createPageUrl("Dashboard"),
      icon: LayoutDashboard,
    },
    {
      title: "Patients",
      url: createPageUrl("Patients"),
      icon: Users,
    },
    {
      title: "OPD Management",
      url: createPageUrl("OPDManagement"),
      icon: Building2,
    },
    {
      title: "Demographic",
      url: createPageUrl("Demographic"),
      icon: FileText,
    },
    {
      title: "Pre OPD",
      url: createPageUrl("PreOPD"),
      icon: ClipboardEdit,
    },
    {
      title: "Medical Records",
      url: createPageUrl("MedicalRecords"),
      icon: FileText,
    },
    {
      title: "Laboratory",
      url: createPageUrl("Laboratory"),
      icon: FlaskConical,
    },
    {
      title: "Pharmacy",
      url: createPageUrl("Pharmacy"),
      icon: Pill,
    },
    {
      title: "Hospital Billing",
      url: createPageUrl("Billing"),
      icon: Receipt,
    },
    {
      title: "Accounts",
      url: createPageUrl("Accounts"),
      icon: Landmark,
    },
    {
      title: "IPD Doctor Station",
      url: createPageUrl("IPDDoctorStation"),
      icon: Stethoscope,
    },
    {
      title: "IPD Nursing Station",
      url: createPageUrl("IPDNursingStation"),
      icon: HeartPulse,
    },
    {
      title: "IPD Bed Management",
      url: createPageUrl("BedManagement"),
      icon: Bed,
    },
    {
      title: "Inventory Management",
      url: createPageUrl("Inventory"),
      icon: Package,
    },
    {
      title: "Departments",
      url: createPageUrl("Departments"),
      icon: Building2,
    },
    {
      title: "Employees",
      url: createPageUrl("Employees"),
      icon: Users,
    },
    {
      title: "Services",
      url: createPageUrl("Services"),
      icon: Stethoscope,
    },
    {
      title: "OT Management",
      url: createPageUrl("OTManagement"),
      icon: Scissors,
    },
    {
      title: "User Management",
      url: createPageUrl("UserManagement"),
      icon: UserCog,
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium text-gray-600">Loading HIMS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MediCare HIMS</h1>
            <p className="text-gray-600">Hospital Information Management System</p>
          </div>
          <Button
            onClick={() => User.login()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3"
          >
            Sign in to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">MediCare HIMS</h2>
                <p className="text-xs text-gray-500">Hospital Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 font-medium' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">
                    {user?.role || 'Staff'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">{currentPageName}</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-50 px-3 py-2 rounded-lg">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">System Online</span>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <div className="flex-1 overflow-auto bg-gray-50">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
