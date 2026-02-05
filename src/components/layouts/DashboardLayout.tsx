import React from "react";
import { SidebarItem } from "../fragments/SidebarItem";
import { LayoutDashboard, Users, Settings, PieChart, Wallet, Bell, Search } from "lucide-react";
import { Button } from "../elements/Button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 fixed h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            RikalG22
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Dashboard Admin</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Overview" active />
          <SidebarItem icon={Users} label="Audience" />
          <SidebarItem icon={Wallet} label="Revenue" />
          <SidebarItem icon={PieChart} label="Analytics" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              FR
            </div>
            <div className="text-sm">
              <p className="font-semibold text-zinc-900 dark:text-white">Frendy Rikal</p>
              <p className="text-zinc-500 text-xs">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {/* Topbar */}
        <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg w-64">
                <Search size={18} />
                <input 
                    type="text" 
                    placeholder="Search anything..." 
                    className="bg-transparent border-none outline-none text-sm w-full text-zinc-700 dark:text-zinc-200"
                />
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="!p-2">
                    <Bell size={20} />
                </Button>
            </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};