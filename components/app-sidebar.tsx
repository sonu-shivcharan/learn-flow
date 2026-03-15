"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, BarChart, List, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = {
  student: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Browse",
      url: "/search",
      icon: Compass,
    },
  ],
  teacher: [
    {
      title: "Courses",
      url: "/teacher/courses",
      icon: List,
    },
    {
      title: "Analytics",
      url: "/teacher/analytics",
      icon: BarChart,
    },
  ],
};

export function AppSidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => setRole(data.role))
      .catch((err) => console.error(err));
  }, []);

  const isTeacherPage = pathname?.startsWith("/teacher");
  const navItems = isTeacherPage ? items.teacher : items.student;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center p-0 border-b">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <span className="font-bold text-xl text-foreground tracking-tight">LearnFlow</span>
        </Link>
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full">
           <span className="font-bold text-lg text-foreground">LF</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            {isTeacherPage ? "Teacher Mode" : "Student Mode"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url || pathname?.startsWith(`${item.url}/`);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        {isTeacherPage ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Exit Teacher Mode">
                <Link href="/dashboard">
                  <LogOut className="h-4 w-4" />
                  <span>Exit Teacher Mode</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (role === "INSTRUCTOR" || role === "ADMIN") ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Teacher Mode">
                <Link href="/teacher/courses">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Teacher Mode</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
