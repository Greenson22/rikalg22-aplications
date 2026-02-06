// src/components/fragments/surat-control/ProfileTab.tsx
import React from 'react';
import { User, Trash2, Save } from 'lucide-react';
import { Button } from '../../elements/Button';
import { UserProfile } from '../../../types/surat';

interface ProfileTabProps {
  savedProfiles: UserProfile[];
  onLoadProfile: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSaveCurrentProfile: () => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfileTab = ({
  savedProfiles,
  onLoadProfile,
  onSaveCurrentProfile,
  onDeleteProfile,
}: ProfileTabProps) => {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200 space-y-6">
      
      {/* BAGIAN: Profil */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">
          <User size={18} className="text-blue-500"/>
          Pilih Profil Tersimpan
        </label>
        
        <div className="bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <select onChange={onLoadProfile} className="w-full bg-transparent p-2.5 text-sm outline-none text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <option value="">-- Pilih Data Profil Untuk Dimuat --</option>
              {savedProfiles.map(p => <option key={p.id} value={p.id}>{p.profileName}</option>)}
            </select>
        </div>

        {/* List Profil Kecil (Preview) */}
        {savedProfiles.length > 0 && (
          <div className="space-y-2">
            <ul className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
              {savedProfiles.map(p => (
                <li key={p.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800 text-sm group">
                  <span className="truncate">{p.profileName} <span className="text-xs text-zinc-400 ml-1">({p.fullName})</span></span>
                  <button onClick={() => onDeleteProfile(p.id)} className="text-zinc-400 hover:text-red-500 transition-colors" title="Hapus Profil">
                      <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={onSaveCurrentProfile} className="w-full justify-center" variant="ghost">
          <Save size={16} /> Simpan Data Input Saat Ini
        </Button>
      </div>
    </div>
  );
};