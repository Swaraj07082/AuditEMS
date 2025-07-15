"use client";
import { LayoutDashboard, Users, FileText, LogOut, ChevronLeft, ChevronRight, ShieldIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Sidebar({ 
  isOpen,
  toggleSidebar
}: {
  isOpen: boolean
  toggleSidebar: () => void
}) {
  const pathname = usePathname();
  
  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Reports", href: "/admin/reports", icon: FileText },
  ];

  return (
    <div className={cn(
      "fixed h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40",
      "transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {isOpen ? (
            <h1 className="text-lg font-semibold">Admin Portal</h1>
          ) : (
            <div className="h-8 w-8 flex items-center justify-center">
              <ShieldIcon className="h-6 w-6 text-primary" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md p-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 dark:bg-gray-700 text-primary"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700",
                  !isOpen && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5" />
                {isOpen && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              !isOpen && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            {isOpen && <span className="ml-3">Sign Out</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
