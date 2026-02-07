// src/components/fragments/surat-control/AIGeneratorTab.tsx
import React, { useState } from 'react';
import { User, FilePlus, Save, ChevronUp, ChevronDown, Briefcase, Copy, ArrowDownToLine, Settings, Plus, Trash2, X, ListChecks, Users, Edit3, RefreshCw, ScanLine, Type } from 'lucide-react';
import { DataRow, AttachmentItem, JobTarget, UserProfile } from '../../../types/surat';
import { Button } from '../../elements/Button';

interface AIGeneratorTabProps {
  personalDetails: DataRow[];
  onDetailChange: (index: number, val: string) => void;
  
  // Props Lampiran
  attachments: AttachmentItem[];
  onToggleAttachment: (id: string) => void;
  onUpdateAttachment: (id: string, text: string) => void;
  onDeleteAttachment: (id: string) => void;
  onAddAttachment: () => void;

  targetJob: JobTarget;
  setTargetJob: (val: JobTarget) => void;
  promptLength: 'normal' | 'short';
  setPromptLength: (val: 'normal' | 'short') => void;
  onGeneratePrompt: () => void; // Kita akan override ini di dalam component
  jsonInput: string;
  setJsonInput: (val: string) => void;
  onImportJson: () => void;
  onResetData: () => void;
  onSaveProfile: () => void;
  
  // Props Profile Management
  savedProfiles: UserProfile[];
  setSavedProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  onLoadProfile: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const STANDARD_LABELS = [
  'Nama', 
  'Tempat, Tgl. Lahir', 
  'Pendidikan Terakhir', 
  'Alamat', 
  'No. Telepon', 
  'Email'
];

export const AIGeneratorTab = ({
  personalDetails, onDetailChange,
  attachments, onToggleAttachment, onUpdateAttachment, onDeleteAttachment, onAddAttachment,
  targetJob, setTargetJob,
  promptLength, setPromptLength,
  onGeneratePrompt: originalOnGenerate, // Rename prop asli
  jsonInput, setJsonInput, onImportJson,
  onResetData, onSaveProfile,
  savedProfiles, setSavedProfiles, onLoadProfile
}: AIGeneratorTabProps) => {
  const [showDetailInputs, setShowDetailInputs] = useState(true);
  const [showAttachmentInputs, setShowAttachmentInputs] = useState(true);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  
  // MODE INPUT: 'manual' (ketik posisi) atau 'pamphlet' (analisa gambar)
  const [inputMode, setInputMode] = useState<'manual' | 'pamphlet'>('manual');

  // State Manage Profile Modal
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null); 
  const [editFormData, setEditFormData] = useState<UserProfile | null>(null); 

  // --- LOGIC: GENERATE PROMPT (CUSTOM) ---
  const handleGeneratePrompt = () => {
    const personal = personalDetails.map(d => `- ${d.label}: ${d.value}`).join('\n');
    const att = attachments.filter(a => a.isChecked).map(a => a.text).join(', ');
    const style = promptLength === 'short' ? "SINGKAT & PADAT (maks 2 paragraf)" : "PROFESIONAL & LENGKAP (3 paragraf)";
    
    let promptText = "";

    if (inputMode === 'manual') {
        // Mode Lama: Data Lowongan diketik manual
        promptText = `
DATA SAYA:
${personal}
Lampiran: ${att}

INFO LOWONGAN:
Posisi: ${targetJob.position}
Perusahaan: ${targetJob.company}
Syarat/Konteks: ${targetJob.requirements}

INSTRUKSI:
Buat surat lamaran kerja ${style} berdasarkan data di atas.
Output WAJIB format JSON valid tanpa markdown code block:
{
  "header": { "cityDate": "...", "subject": "...", "recipientTitle": "...", "companyName": "...", "recipientAddress": "..." },
  "paragraphs": ["Paragraf pembuka...", "Paragraf isi (skill match)...", "Paragraf penutup..."]
}`;
    } else {
        // Mode Baru: Pamflet/Poster
        promptText = `
INSTRUKSI UTAMA:
Saya akan melampirkan GAMBAR/TEKS lowongan kerja (pamflet) bersamaan dengan prompt ini.
Tolong ANALISIS lowongan tersebut untuk mengetahui Posisi, Nama Perusahaan, dan Syaratnya secara otomatis.

DATA PELAMAR (SAYA):
${personal}
Lampiran yang saya miliki: ${att}

TUGAS ANDA:
1. Baca lowongan kerja yang saya berikan (teks/gambar).
2. Cocokkan skill saya dengan syarat di lowongan tersebut.
3. Buat surat lamaran kerja ${style}.

FORMAT OUTPUT (WAJIB JSON VALID):
{
  "header": { 
    "cityDate": "Kota, Tanggal Hari Ini", 
    "subject": "Lamaran Pekerjaan - [Posisi yg dideteksi]", 
    "recipientTitle": "Yth. HRD / Pimpinan", 
    "companyName": "[Nama Perusahaan yg dideteksi]", 
    "recipientAddress": "[Alamat Perusahaan jika ada, atau 'di Tempat']" 
  },
  "paragraphs": ["Paragraf pembuka (sebutkan posisi & perusahaan)", "Paragraf isi (hubungkan skill saya dengan syarat)", "Paragraf penutup"]
}
`;
    }

    navigator.clipboard.writeText(promptText);
    alert(inputMode === 'manual' 
        ? "Prompt Manual disalin!" 
        : "Prompt Mode Pamflet disalin!\n\nLangkah selanjutnya:\n1. Buka ChatGPT/Gemini\n2. Paste Prompt ini\n3. Upload Gambar/Paste Teks Lowongan Kerja");
  };


  // --- Handlers for Manage Profile (Existing Logic) ---
  const handleStartEdit = (profile: UserProfile) => {
    setEditingProfileId(profile.id);
    setEditFormData(JSON.parse(JSON.stringify(profile))); 
  };

  const handleStartAdd = () => {
    const newId = Date.now().toString();
    setEditingProfileId('new');
    setEditFormData({
      id: newId,
      profileName: 'Profil Baru',
      fullName: '',
      details: STANDARD_LABELS.map((label, idx) => ({
        id: (idx + 1).toString(),
        label,
        value: '',
        isBold: label === 'Nama'
      })),
      attachments: [
        { id: '1', text: "Daftar Riwayat Hidup (CV)", isChecked: true },
        { id: '2', text: "Portofolio", isChecked: true }
      ]
    });
  };

  const handleCancelEdit = () => {
    setEditingProfileId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;
    const namaRow = editFormData.details.find(d => d.label.toLowerCase().includes('nama'));
    const finalData = {
        ...editFormData,
        fullName: namaRow ? namaRow.value : (editFormData.fullName || "Tanpa Nama")
    };
    try {
        const method = editingProfileId === 'new' ? 'POST' : 'PUT';
        const res = await fetch('/api/profiles', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData)
        });
        if (!res.ok) throw new Error("Gagal menyimpan ke database");
    } catch (e) {
        console.error(e);
        alert("Terjadi kesalahan saat menyimpan data.");
        return; 
    }
    if (editingProfileId === 'new') {
        setSavedProfiles(prev => [...prev, finalData]);
    } else {
        setSavedProfiles(prev => prev.map(p => p.id === finalData.id ? finalData : p));
    }
    setEditingProfileId(null);
    setEditFormData(null);
  };

  const handleDeleteFromModal = async (id: string) => {
      if(!confirm("Hapus profil ini permanen?")) return;
      try {
        const res = await fetch(`/api/profiles?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Gagal menghapus");
        setSavedProfiles(prev => prev.filter(p => p.id !== id));
        if (editingProfileId === id) handleCancelEdit();
      } catch (e) {
        console.error(e);
        alert("Gagal menghapus data.");
      }
  };

  const updateEditField = (field: 'profileName' | 'fullName', val: string) => {
      setEditFormData(prev => prev ? ({ ...prev, [field]: val }) : null);
  };
  const updateEditDetailValue = (idx: number, val: string) => {
      setEditFormData(prev => {
          if(!prev) return null;
          const updatedDetails = [...prev.details];
          updatedDetails[idx] = { ...updatedDetails[idx], value: val };
          return { ...prev, details: updatedDetails };
      });
  };
  const updateEditDetailLabel = (idx: number, val: string) => {
      setEditFormData(prev => {
          if(!prev) return null;
          const updatedDetails = [...prev.details];
          updatedDetails[idx] = { ...updatedDetails[idx], label: val };
          return { ...prev, details: updatedDetails };
      });
  };
  const removeDetailRow = (idx: number) => {
      setEditFormData(prev => {
          if(!prev) return null;
          const newDetails = prev.details.filter((_, i) => i !== idx);
          return { ...prev, details: newDetails };
      });
  };
  const addDetailRow = (label: string = '') => {
      setEditFormData(prev => {
          if(!prev) return null;
          const newRow: DataRow = {
              id: Date.now().toString() + Math.random(),
              label: label || 'Label Baru',
              value: '',
              isBold: label === 'Nama'
          };
          return { ...prev, details: [...prev.details, newRow] };
      });
  };

  const missingStandards = editFormData 
    ? STANDARD_LABELS.filter(std => !editFormData.details.some(d => d.label.trim().toLowerCase() === std.toLowerCase()))
    : [];

  return (
    <>
      {/* --- MODAL: KELOLA LAMPIRAN (Popup) --- */}
      {isAttachmentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border dark:border-zinc-800 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold flex items-center gap-2 text-zinc-800 dark:text-white">
                <ListChecks size={20} className="text-green-600" /> Kelola Lampiran
              </h3>
              <button onClick={() => setIsAttachmentModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 group transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                  <input type="checkbox" checked={att.isChecked} onChange={() => onToggleAttachment(att.id)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <input type="text" value={att.text} onChange={() => {}} readOnly className={`flex-1 bg-transparent text-sm border-none outline-none focus:ring-0 ${!att.isChecked ? 'text-zinc-400 line-through' : 'text-zinc-800 dark:text-zinc-200'}`} placeholder="Nama dokumen..." />
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-2xl space-y-3">
              <Button onClick={() => setIsAttachmentModalOpen(false)} className="w-full justify-center">Selesai</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: KELOLA PROFIL (CRUD) --- */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl h-[550px] rounded-2xl shadow-2xl border dark:border-zinc-800 flex overflow-hidden">
             
             {/* Left Sidebar: List Profiles */}
             <div className="w-1/3 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-800 dark:text-white mb-2">Daftar Orang</h3>
                    <button onClick={handleStartAdd} className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"><Plus size={14}/> Tambah Baru</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {savedProfiles.map(p => (
                        <div key={p.id} onClick={() => handleStartEdit(p)} className={`p-3 rounded-lg border cursor-pointer transition-all ${editingProfileId === p.id ? 'bg-white shadow-md border-blue-500 ring-1 ring-blue-500' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-300'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{p.profileName}</p>
                                    <p className="text-xs text-zinc-500 truncate">{p.fullName}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteFromModal(p.id); }} className="text-zinc-300 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Right Content: Form */}
             <div className="w-2/3 flex flex-col bg-white dark:bg-zinc-900">
                <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-800 dark:text-white">{editingProfileId === 'new' ? 'Buat Profil Baru' : editingProfileId ? 'Edit Profil' : 'Pilih Profil'}</h3>
                    <button onClick={() => setIsManageModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {!editingProfileId ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center">
                            <User size={48} className="mb-4 opacity-20"/>
                            <p className="text-sm">Pilih orang dari daftar di sebelah kiri<br/>untuk melihat atau mengedit detailnya.</p>
                        </div>
                    ) : (
                        editFormData && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Nama Profil (Label)</label>
                                    <input type="text" value={editFormData.profileName} onChange={e => updateEditField('profileName', e.target.value)} className="w-full mt-1 p-2 text-sm border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Misal: Profil Saya (Formal)" />
                                </div>
                                <div className="border-t border-zinc-100 dark:border-zinc-800 my-4"></div>
                                <div className="flex justify-between items-end mb-2">
                                  <h4 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">Detail Data Diri</h4>
                                  <button onClick={() => addDetailRow()} className="text-[10px] flex items-center gap-1 font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition"><Plus size={10}/> Custom Field</button>
                                </div>
                                <div className="space-y-2">
                                  {editFormData.details.map((detail, idx) => (
                                      <div key={idx} className="group flex items-center gap-2">
                                          <div className="w-1/3">
                                               <input type="text" value={detail.label} onChange={e => updateEditDetailLabel(idx, e.target.value)} className="w-full bg-transparent text-[10px] font-bold text-zinc-500 uppercase text-right pr-2 border-b border-transparent focus:border-blue-400 outline-none transition-colors hover:text-zinc-700" placeholder="LABEL..." />
                                          </div>
                                          <div className="flex-1 relative">
                                              <input type="text" value={detail.value} onChange={e => updateEditDetailValue(idx, e.target.value)} className="w-full p-1.5 text-xs border rounded bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 focus:border-blue-500 outline-none pr-8" placeholder={`Isi data...`} />
                                          </div>
                                          <button onClick={() => removeDetailRow(idx)} className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                      </div>
                                  ))}
                                </div>
                                {missingStandards.length > 0 && (
                                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-dashed border-blue-200 dark:border-blue-800">
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1"><RefreshCw size={10} /> Kembalikan Data Standar:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {missingStandards.map(label => (
                                        <button key={label} onClick={() => addDetailRow(label)} className="text-[10px] px-2 py-1 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 rounded-md text-zinc-600 dark:text-zinc-300 hover:text-blue-600 hover:border-blue-400 transition shadow-sm">+ {label}</button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                        )
                    )}
                </div>
                {editingProfileId && (
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50">
                        <Button variant="ghost" onClick={handleCancelEdit} className="text-xs">Batal</Button>
                        <Button onClick={handleSaveEdit} className="text-xs"><Save size={14}/> Simpan Perubahan</Button>
                    </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* --- CONTENT UTAMA --- */}
      <div className="animate-in fade-in zoom-in-95 duration-200 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* --- CARD DATA PELAMAR --- */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 text-sm">
                  <User size={16} className="text-blue-500" /> 0. Data Pelamar
                </h4>
                <button onClick={() => setIsManageModalOpen(true)} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                    <Edit3 size={10} /> Kelola Data Orang
                </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
                 <Users size={16} className="ml-2 text-zinc-400"/>
                 <select onChange={onLoadProfile} className="w-full bg-transparent p-1.5 text-xs font-medium outline-none text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <option value="">-- Pilih Orang Tersimpan --</option>
                    {savedProfiles.map(p => <option key={p.id} value={p.id}>{p.profileName}</option>)}
                 </select>
              </div>

              <div className="flex gap-2">
                <button onClick={onResetData} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors border border-zinc-200 dark:border-zinc-700">
                  <FilePlus size={14} /> Reset / Baru
                </button>
                <button onClick={onSaveProfile} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-xs font-bold transition-colors border border-blue-100 dark:border-blue-800">
                  <Save size={14} /> Simpan Sbg Profil
                </button>
              </div>

              {/* ACCORDION DATA DIRI */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-2">
                <button onClick={() => setShowDetailInputs(!showDetailInputs)} className="flex items-center justify-between w-full text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors mb-2">
                  <span>EDIT DETAIL INPUT</span>
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

              {/* ACCORDION LAMPIRAN */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => setShowAttachmentInputs(!showAttachmentInputs)} className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
                    <span>PILIH LAMPIRAN ({attachments.filter(a => a.isChecked).length})</span>
                    {showAttachmentInputs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  
                  <button onClick={() => setIsAttachmentModalOpen(true)} className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-[10px] font-bold text-zinc-600 dark:text-zinc-300 transition-colors">
                    <Settings size={12} /> Kelola / Edit
                  </button>
                </div>

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

          {/* --- CARD 1. INFO LOWONGAN (MODIFIED FOR TABS) --- */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4">
            <h4 className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-4 text-sm"><Briefcase size={16} /> 1. Target Lamaran</h4>
            
            {/* Tab Switcher Mode */}
            <div className="flex bg-white dark:bg-black p-1 rounded-lg border border-purple-100 dark:border-zinc-700 mb-4">
                <button 
                    onClick={() => setInputMode('manual')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${inputMode === 'manual' ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                    <Type size={14}/> Manual Input
                </button>
                <button 
                    onClick={() => setInputMode('pamphlet')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${inputMode === 'pamphlet' ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                    <ScanLine size={14}/> Scan Pamflet/Gambar
                </button>
            </div>

            <div className="space-y-3">
              {inputMode === 'manual' ? (
                // --- MODE MANUAL INPUT ---
                <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-3">
                    <div><label className="text-xs font-semibold text-zinc-500 uppercase">Posisi Dilamar</label><input type="text" placeholder="Contoh: Frontend Developer" value={targetJob.position} onChange={e => setTargetJob({ ...targetJob, position: e.target.value })} className="w-full mt-1 p-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-zinc-700" /></div>
                    <div><label className="text-xs font-semibold text-zinc-500 uppercase">Nama Perusahaan</label><input type="text" placeholder="Contoh: PT Google Indonesia" value={targetJob.company} onChange={e => setTargetJob({ ...targetJob, company: e.target.value })} className="w-full mt-1 p-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-zinc-700" /></div>
                    <div><label className="text-xs font-semibold text-zinc-500 uppercase">Syarat / Konteks Khusus</label><textarea rows={2} placeholder="Contoh: Harus bisa React.js dan Tailwind." value={targetJob.requirements} onChange={e => setTargetJob({ ...targetJob, requirements: e.target.value })} className="w-full mt-1 p-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-zinc-700 resize-none" /></div>
                </div>
              ) : (
                // --- MODE PAMFLET (AUTO DETECT) ---
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-dashed border-purple-300 dark:border-purple-800 text-center">
                    <ScanLine size={32} className="mx-auto text-purple-400 mb-2"/>
                    <p className="text-sm font-bold text-purple-800 dark:text-purple-200">Mode Auto-Detect Aktif</p>
                    <p className="text-xs text-zinc-500 mt-1">
                        Anda tidak perlu mengisi posisi/perusahaan manual. <br/>
                        Nanti, <b>paste prompt</b> yang dihasilkan ke AI, lalu <b>upload gambar lowongan</b> (pamflet) Anda. AI akan membaca detailnya otomatis.
                    </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200 dark:border-purple-900/50 mt-2">
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
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <h4 className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-2 text-sm"><Copy size={16} /> 2. Generate Prompt</h4>
            <p className="text-xs text-zinc-500 mb-3">
                {inputMode === 'manual' 
                    ? "Sistem akan menggabungkan Data Pelamar & Input Manual Lowongan." 
                    : "Sistem akan membuat instruksi agar AI membaca gambar lowongan Anda."}
            </p>
            <button onClick={handleGeneratePrompt} className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-bold hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                <Copy size={16}/> {inputMode === 'manual' ? 'Salin Prompt Manual' : 'Salin Prompt Mode Pamflet'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 h-full flex flex-col">
            <h4 className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2 text-sm"><ArrowDownToLine size={16} /> 3. Import JSON Result</h4>
            <p className="text-xs text-zinc-500 mb-2">Setelah AI membalas dengan kode JSON, salin dan tempel di sini.</p>
            <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} placeholder='Contoh: { "header": { ... } }' className="w-full flex-1 p-3 text-xs font-mono bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={onImportJson} disabled={!jsonInput} className="mt-3 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">Terapkan ke Surat</button>
          </div>
        </div>
      </div>
    </>
  );
};