"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, LogOut, BarChart, List } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SidebarItem = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => {
  const pathname = usePathname();
  const isActive = (pathname === "/" && href === "/") || pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-x-2 text-zinc-500 text-sm font-medium pl-6 transition-all hover:text-zinc-600 hover:bg-zinc-300/20",
        isActive && "text-blue-700 bg-blue-200/20 hover:bg-blue-200/20 hover:text-blue-700 border-r-4 border-blue-700"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        <Icon size={22} className={cn("text-zinc-500", isActive && "text-blue-700")} />
        {label}
      </div>
    </Link>
  );
};

const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then(res => res.json())
      .then(data => setRole(data.role))
      .catch(err => console.error(err));
  }, []);

  const isTeacherPage = pathname?.startsWith("/teacher");

  return ( 
    <div className="h-full">
      <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50 flex items-center bg-white shadow-sm px-4">
        <div className="flex w-full items-center justify-between">
            <div className="md:hidden">
                {/* Mobile Sidebar Trigger could go here */}
            </div>
            <div className="ml-auto flex items-center gap-x-2">
                {isTeacherPage ? (
                    <Link href="/dashboard">
                        <Button size="sm" variant="ghost">
                            <LogOut className="h-4 w-4 mr-2" />
                            Exit Teacher Mode
                        </Button>
                    </Link>
                ) : (role === "INSTRUCTOR" || role === "ADMIN") ? (
                    <Link href="/teacher/courses">
                        <Button size="sm" variant="ghost">
                            Teacher Mode
                        </Button>
                    </Link>
                ) : null}
                <UserButton />
            </div>
        </div>
      </div>
      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
        <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
          <div className="p-6 flex items-center justify-center font-bold text-xl text-blue-600">
            LearnFlow
          </div>
          <div className="flex flex-col w-full">
            {isTeacherPage ? (
                <>
                    <SidebarItem icon={List} label="Courses" href="/teacher/courses" />
                    <SidebarItem icon={BarChart} label="Analytics" href="/teacher/analytics" />
                </>
            ) : (
                <>
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
                    <SidebarItem icon={Compass} label="Browse" href="/search" />
                </>
            )}
          </div>
        </div>
      </div>
      <main className="md:pl-56 pt-[80px] h-full">
        {children}
      </main>
    </div>
   );
}
 
export default DashboardLayout;
