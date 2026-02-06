// src/components/fragments/surat-control/AIGeneratorTab.tsx
import React, { useState } from 'react';
import { User, FilePlus, Save, ChevronUp, ChevronDown, Briefcase, Copy, ArrowDownToLine } from 'lucide-react';
import { DataRow, AttachmentItem, JobTarget } from '../../../types/surat';

interface AIGeneratorTabProps {
  personalDetails: DataRow[];
  onDetailChange: (index: number, val: string) => void;
  attachments: AttachmentItem[];
  onToggleAttachment: (id: string) => void;
  targetJob: JobTarget;
  setTargetJob: (val: JobTarget) => void;
  promptLength: 'normal' | 'short';
  setPromptLength: (val: 'normal' | 'short') => void;
  onGeneratePrompt: () => void;
  jsonInput: string;
  setJsonInput: (val: string) => void;
  onImportJson: () => void;
  onResetData: () => void;
  onSaveProfile: () => void;
}

export const AIGeneratorTab = ({
  personalDetails, onDetailChange,
  attachments, onToggleAttachment,
  targetJob, setTargetJob,
  promptLength, setPromptLength,
  onGeneratePrompt,
  jsonInput, setJsonInput, onImportJson,
  onResetData, onSaveProfile
}: AIGeneratorTabProps) => {
  const [showDetailInputs, setShowDetailInputs] = useState(true);
  const [showAttachmentInputs, setShowAttachmentInputs] = useState(true);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-200 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* --- CARD DATA PELAMAR --- */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <h4 className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-3 text-sm">
            <User size={16} className="text-blue-500" /> 0. Data Pelamar
          </h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button onClick={onResetData} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors border border-zinc-200 dark:border-zinc-700">
                <FilePlus size={14} /> Reset / Baru
              </button>
              <button onClick={onSaveProfile} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-xs font-bold transition-colors border border-blue-100 dark:border-blue-800">
                <Save size={14} /> Simpan Profil
              </button>
            </div>

            {/* ACCORDION DATA DIRI */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-2">
              <button onClick={() => setShowDetailInputs(!showDetailInputs)} className="flex items-center justify-between w-full text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors mb-2">
                <span>EDIT DETAIL DATA DIRI</span>
                {showDetailInputs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showDetailInputs && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {personalDetails.map((detail, index) => (
                    <div key={detail.id} className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-4 text-[10px] font-medium text-zinc-500 uppercase truncate" title={detail.label}>{detail.label}</label>
                      <input type="text" value={detail.value} placeholder={`Isi ${detail.label}...`} onChange={(e) => onDetailChange(index, e.target.value)} className="col-span-8 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACCORDION LAMPIRAN (Quick View) */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <button onClick={() => setShowAttachmentInputs(!showAttachmentInputs)} className="flex items-center justify-between w-full text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors mb-2">
                <span>PILIH LAMPIRAN ({attachments.filter(a => a.isChecked).length})</span>
                {showAttachmentInputs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showAttachmentInputs && (
                <div className="grid grid-cols-2 gap-2">
                  {attachments.map(att => (
                    <div key={att.id} onClick={() => onToggleAttachment(att.id)} className={`cursor-pointer px-2 py-1.5 rounded border text-[10px] transition-all truncate ${att.isChecked ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                      {att.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- CARD INFO LOWONGAN & PILIHAN SURAT --- */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4">
          <h4 className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-4 text-sm"><Briefcase size={16} /> 1. Info Lowongan & Opsi</h4>
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-zinc-500 uppercase">Posisi Dilamar</label><input type="text" placeholder="Contoh: Frontend Developer" value={targetJob.position} onChange={e => setTargetJob({ ...targetJob, position: e.target.value })} className="w-full mt-1 p-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-zinc-700" /></div>
            <div><label className="text-xs font-semibold text-zinc-500 uppercase">Nama Perusahaan</label><input type="text" placeholder="Contoh: PT Google Indonesia" value={targetJob.company} onChange={e => setTargetJob({ ...targetJob, company: e.target.value })} className="w-full mt-1 p-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-zinc-700" /></div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">Gaya/Panjang Surat</label>
                <div className="flex bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-700 p-1">
                  <button onClick={() => setPromptLength('normal')} className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${promptLength === 'normal' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-zinc-400 hover:text-zinc-600'}`}>Normal</button>
                  <button onClick={() => setPromptLength('short')} className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${promptLength === 'short' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-zinc-400 hover:text-zinc-600'}`}>Pendek</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">Info Tambahan</label>
                <div className="flex items-center h-[34px] px-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-400">
                  {promptLength === 'short' ? 'To-the-point (2 Paragraf)' : 'Standar (3 Paragraf)'}
                </div>
              </div>
            </div>

            <div><label className="text-xs font-semibold text-zinc-500 uppercase">Syarat / Konteks Khusus</label><textarea rows={2} placeholder="Contoh: Harus bisa React.js dan Tailwind." value={targetJob.requirements} onChange={e => setTargetJob({ ...targetJob, requirements: e.target.value })} className="w-full mt-1 p-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-zinc-700 resize-none" /></div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <h4 className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-2 text-sm"><Copy size={16} /> 2. Generate Prompt</h4>
          <p className="text-xs text-zinc-500 mb-3">Sistem akan menggabungkan Data Pelamar & Lampiran dengan Info Lowongan.</p>
          <button onClick={onGeneratePrompt} className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-bold hover:shadow-lg transition-all active:scale-95">Salin Prompt ke Clipboard</button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 h-full flex flex-col">
          <h4 className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2 text-sm"><ArrowDownToLine size={16} /> 3. Import JSON Result</h4>
          <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} placeholder='Contoh: { "header": { ... } }' className="w-full flex-1 p-3 text-xs font-mono bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none" />
          <button onClick={onImportJson} disabled={!jsonInput} className="mt-3 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">Terapkan ke Surat</button>
        </div>
      </div>
    </div>
  );
};