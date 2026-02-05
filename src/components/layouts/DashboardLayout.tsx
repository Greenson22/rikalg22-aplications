"use client";

import React, { useState } from "react";
import { SidebarItem } from "../fragments/SidebarItem";
import { LayoutDashboard, FileText, Bell, Search } from "lucide-react";
import { Button } from "../elements/Button";

// Import view yang akan ditampilkan
import { DashboardView } from "../views/DashboardView"; 
import { SuratLamaranView } from "../views/SuratLamaranView";

interface DashboardLayoutProps {
  children?: React.ReactNode; // Optional karena kita handle content secara internal sekarang
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // State untuk melacak halaman mana yang aktif
  // Defaultnya 'overview'
  const [activePage, setActivePage] = useState<'overview' | 'surat'>('overview');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 fixed h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            RikalG22
          </h1>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-1">
            Frendy Rikal Gerung
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">Dashboard Admin</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Overview" 
            active={activePage === 'overview'} 
            onClick={() => setActivePage('overview')} // Ubah state saat diklik
          />
          <SidebarItem 
            icon={FileText} 
            label="Surat Lamaran" 
            active={activePage === 'surat'} 
            onClick={() => setActivePage('surat')} // Ubah state saat diklik
          />
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

        {/* Dynamic Content: Render Berdasarkan State */}
        <div className="p-6 max-w-7xl mx-auto">
          {activePage === 'overview' ? (
             // Jika ada children bawaan, tampilkan children (jika digunakan sebagai wrapper), 
             // atau default ke DashboardView jika children kosong
             children || <DashboardView />
          ) : (
             <SuratLamaranView />
          )}
        </div>
      </main>
    </div>
  );
};