"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass } from "lucide-react";
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
  return ( 
    <div className="h-full">
      <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50 flex items-center bg-white shadow-sm px-4">
        <div className="flex w-full justify-end">
            <UserButton />
        </div>
      </div>
      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
        <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
          <div className="p-6 flex items-center justify-center font-bold text-xl text-blue-600">
            LearnFlow
          </div>
          <div className="flex flex-col w-full">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
            <SidebarItem icon={Compass} label="Browse" href="/search" />
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
