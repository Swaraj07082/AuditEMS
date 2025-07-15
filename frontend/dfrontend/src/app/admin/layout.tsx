"use client";
import { useState } from "react";
import { Sidebar } from "../Components/admin/sidebar";
import { Header } from "../Components/admin/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar with fixed positioning */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main content area */}
      <div className={`
        flex-1 flex flex-col
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'ml-64' : 'ml-20'}
        w-[calc(100vw-80px)]
        h-full
        overflow-hidden
      `}>
        <Header toggleSidebar={toggleSidebar} />
        
        {/* Scrollable content container */}
        <main className="
          flex-1 overflow-y-auto p-6 
          bg-gray-50 dark:bg-gray-900
          w-full
        ">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
