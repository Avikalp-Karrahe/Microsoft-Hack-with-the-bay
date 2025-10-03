"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  MessageSquare
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Documents",
      url: "/dashboard/documents",
      icon: FileText,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Agents",
      url: "/dashboard/agents",
      icon: Users,
    },
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-[#6366f1] text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                  <div className="grid grid-cols-2 gap-[2px] w-4 h-4">
                    <div className="bg-white rounded-[1px]"></div>
                    <div className="bg-white rounded-[1px]"></div>
                    <div className="bg-white rounded-[1px]"></div>
                    <div className="bg-white rounded-[1px]"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">LoanPro</span>
                  <span className="text-xs text-muted-foreground">Modern Credit Platform</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <a href={item.url} className="font-medium">
                    <item.icon className="size-4" />
                    {item.title}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
