// src/components/fragments/surat-control/ProfileTab.tsx
import React from 'react';
import { User, Trash2, Save, ListChecks, Plus } from 'lucide-react';
import { Button } from '../../elements/Button';
import { UserProfile, AttachmentItem } from '../../../types/surat'; // Sesuaikan path

interface ProfileTabProps {
  savedProfiles: UserProfile[];
  onLoadProfile: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSaveCurrentProfile: () => void;
  onDeleteProfile: (id: string) => void;
  attachments: AttachmentItem[];
  onToggleAttachment: (id: string) => void;
  onUpdateAttachment: (id: string, text: string) => void;
  onDeleteAttachment: (id: string) => void;
  onAddAttachment: () => void;
}

export const ProfileTab = ({
  savedProfiles,
  onLoadProfile,
  onSaveCurrentProfile,
  onDeleteProfile,
  attachments,
  onToggleAttachment,
  onUpdateAttachment,
  onDeleteAttachment,
  onAddAttachment
}: ProfileTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* KOLOM KIRI: Load/Save Profil */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Pilih Profil Tersimpan</label>
        <div className="flex gap-2">
          <select onChange={onLoadProfile} className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Pilih Data Profil --</option>
            {savedProfiles.map(p => <option key={p.id} value={p.id}>{p.profileName}</option>)}
          </select>
        </div>

        {savedProfiles.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase">Daftar Profil:</h4>
            <ul className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
              {savedProfiles.map(p => (
                <li key={p.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg border border-zinc-100 dark:border-zinc-700 text-sm group">
                  <span>{p.profileName} <span className="text-xs text-zinc-400">({p.fullName})</span></span>
                  <button onClick={() => onDeleteProfile(p.id)} className="text-zinc-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button onClick={onSaveCurrentProfile} className="w-full justify-center">
            <Save size={18} /> Simpan Data Saat Ini sebagai Profil
          </Button>
        </div>
      </div>

      {/* KOLOM KANAN: KELOLA LAMPIRAN */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm h-full flex flex-col">
          <h4 className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-3 text-sm">
            <ListChecks size={18} className="text-green-600" /> Kelola Lampiran
          </h4>
          <p className="text-xs text-zinc-500 mb-3">
            Centang item yang ingin disertakan dalam surat.
          </p>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[250px] pr-1">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 group transition-all">
                <input
                  type="checkbox"
                  checked={att.isChecked}
                  onChange={() => onToggleAttachment(att.id)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <input
                  type="text"
                  value={att.text}
                  onChange={(e) => onUpdateAttachment(att.id, e.target.value)}
                  className={`flex-1 bg-transparent text-sm border-none outline-none focus:ring-0 ${!att.isChecked ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-300'}`}
                  placeholder="Isi lampiran..."
                />
                <button
                  onClick={() => onDeleteAttachment(att.id)}
                  className="text-zinc-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={onAddAttachment}
            className="mt-3 flex items-center justify-center gap-2 w-full py-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <Plus size={14} /> Tambah Item Lampiran
          </button>
        </div>
      </div>
    </div>
  );
};