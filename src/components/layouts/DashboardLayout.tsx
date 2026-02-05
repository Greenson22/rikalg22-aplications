"use client";

import React, { useState } from "react";
import { SidebarItem } from "../fragments/SidebarItem";
import { LayoutDashboard, FileText, Bell, Search, Menu, X } from "lucide-react";
import { Button } from "../elements/Button";

// Import view yang akan ditampilkan
import { DashboardView } from "../views/DashboardView"; 
import { SuratLamaranView } from "../views/SuratLamaranView";

interface DashboardLayoutProps {
  children?: React.ReactNode; 
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [activePage, setActivePage] = useState<'overview' | 'surat'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    // ROOT: h-screen membuat tinggi aplikasi fix setinggi layar. overflow-hidden mematikan scroll browser bawaan.
    <div className="h-screen bg-zinc-50 dark:bg-black flex overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 
          transform transition-transform duration-300 ease-in-out flex flex-col flex-shrink-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static ${!isSidebarOpen && "md:hidden"} 
        `}
      >
        <div className="p-6 flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              RikalG22
            </h1>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-1">
              Frendy Rikal Gerung
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">Dashboard Admin</p>
          </div>
          {/* Tombol Close (Mobile Only) */}
          <button onClick={toggleSidebar} className="md:hidden text-zinc-500 hover:text-red-500">
            <X size={20} />
          </button>
        </div>
        
        {/* Navigasi Sidebar (Scrollable jika menu sangat panjang) */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Overview" 
            active={activePage === 'overview'} 
            onClick={() => { setActivePage('overview'); if(window.innerWidth < 768) setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={FileText} 
            label="Surat Lamaran" 
            active={activePage === 'surat'} 
            onClick={() => { setActivePage('surat'); if(window.innerWidth < 768) setIsSidebarOpen(false); }} 
          />
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
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

      {/* Overlay Background (Mobile Only) */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={toggleSidebar}
        />
      )}

      {/* --- MAIN LAYOUT --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* HEADER: Tidak sticky, tapi flex-shrink-0 agar diam di tempat */}
        <header className="flex-shrink-0 h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-between z-30">
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                >
                    <Menu size={20} />
                </button>

                <div className="flex items-center gap-2 text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg w-full md:w-64">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-transparent border-none outline-none text-sm w-full text-zinc-700 dark:text-zinc-200"
                    />
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="!p-2">
                    <Bell size={20} />
                </Button>
            </div>
        </header>

        {/* CONTENT SCROLL AREA */}
        {/* Area ini yang memiliki scrollbar (overflow-y-auto) */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {activePage === 'overview' ? (
               children || <DashboardView />
            ) : (
               <SuratLamaranView />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};