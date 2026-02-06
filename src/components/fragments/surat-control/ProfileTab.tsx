// src/components/fragments/surat-control/ProfileTab.tsx
import React, { useState } from 'react';
import { User, Trash2, Save, ListChecks, Plus, X, Edit3, CheckSquare } from 'lucide-react';
import { Button } from '../../elements/Button';
import { UserProfile, AttachmentItem } from '../../../types/surat';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hitung jumlah lampiran aktif untuk preview
  const activeCount = attachments.filter(a => a.isChecked).length;

  return (
    <>
      {/* --- MODAL: KELOLA LAMPIRAN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border dark:border-zinc-800 flex flex-col max-h-[85vh]">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold flex items-center gap-2 text-zinc-800 dark:text-white">
                <ListChecks size={20} className="text-green-600" /> 
                Kelola Lampiran
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body: Daftar Lampiran */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
              <p className="text-xs text-zinc-500 mb-2">
                Centang item yang ingin ditampilkan di surat. Anda bisa mengedit teksnya langsung.
              </p>
              
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 group transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
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
                    className={`flex-1 bg-transparent text-sm border-none outline-none focus:ring-0 ${!att.isChecked ? 'text-zinc-400 line-through' : 'text-zinc-800 dark:text-zinc-200'}`}
                    placeholder="Isi nama dokumen..."
                  />
                  <button
                    onClick={() => onDeleteAttachment(att.id)}
                    className="text-zinc-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus baris"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer Modal: Tombol Tambah */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-2xl">
              <button
                onClick={onAddAttachment}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-zinc-800 border border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <Plus size={16} /> Tambah Item Baru
              </button>
              <div className="mt-3">
                 <Button onClick={() => setIsModalOpen(false)} className="w-full justify-center">Selesai</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAMPILAN UTAMA TAB (Single Column) --- */}
      <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200 space-y-8">
        
        {/* BAGIAN 1: Profil */}
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
              <ul className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
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

        {/* BAGIAN 2: Lampiran (Dengan Toggle) */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
          
          {/* Header Baris: Label + Tombol Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    <CheckSquare size={18} className="text-green-600"/>
                    Pilih Lampiran
                </label>
                <span className="text-xs text-zinc-500 mt-0.5">{activeCount} item akan dilampirkan</span>
            </div>
            
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800"
            >
                <Edit3 size={14} />
                Atur Lampiran
            </button>
          </div>

          {/* Preview Chips Lampiran (Read Only) */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 min-h-[60px]">
             {activeCount === 0 ? (
                 <p className="text-xs text-zinc-400 italic text-center py-2">Tidak ada lampiran dipilih. Klik "Atur Lampiran".</p>
             ) : (
                 <div className="flex flex-wrap gap-2">
                    {attachments.filter(a => a.isChecked).map(a => (
                        <span key={a.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-600 dark:text-zinc-300 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            {a.text}
                        </span>
                    ))}
                 </div>
             )}
          </div>

        </div>
      </div>
    </>
  );
};