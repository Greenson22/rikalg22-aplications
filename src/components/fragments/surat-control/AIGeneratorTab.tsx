// src/components/fragments/surat-control/AIGeneratorTab.tsx
import React, { useState } from 'react';
import { User, FilePlus, Save, ChevronUp, ChevronDown, Briefcase, Copy, ArrowDownToLine, Settings, Plus, Trash2, X, ListChecks, Users, Edit3, Check } from 'lucide-react';
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
  onGeneratePrompt: () => void;
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

export const AIGeneratorTab = ({
  personalDetails, onDetailChange,
  attachments, onToggleAttachment, onUpdateAttachment, onDeleteAttachment, onAddAttachment,
  targetJob, setTargetJob,
  promptLength, setPromptLength,
  onGeneratePrompt,
  jsonInput, setJsonInput, onImportJson,
  onResetData, onSaveProfile,
  savedProfiles, setSavedProfiles, onLoadProfile
}: AIGeneratorTabProps) => {
  const [showDetailInputs, setShowDetailInputs] = useState(true);
  const [showAttachmentInputs, setShowAttachmentInputs] = useState(true);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  
  // State Manage Profile Modal
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null); 
  const [editFormData, setEditFormData] = useState<UserProfile | null>(null); 

  // Handlers for Manage Profile
  const handleStartEdit = (profile: UserProfile) => {
    setEditingProfileId(profile.id);
    setEditFormData(JSON.parse(JSON.stringify(profile))); // Deep copy
  };

  const handleStartAdd = () => {
    const newId = Date.now().toString();
    setEditingProfileId('new');
    // UPDATE: Menambahkan field default lengkap sesuai permintaan
    setEditFormData({
      id: newId,
      profileName: 'Profil Baru',
      fullName: '',
      details: [
        { id: '1', label: 'Nama', value: '', isBold: true },
        { id: '2', label: 'Tempat, Tgl. Lahir', value: '' },
        { id: '3', label: 'Pendidikan Terakhir', value: '' },
        { id: '4', label: 'Alamat', value: '' },
        { id: '5', label: 'No. Telepon', value: '' },
        { id: '6', label: 'Email', value: '' }
      ],
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

  const handleSaveEdit = () => {
    if (!editFormData) return;
    
    // Auto-update fullName dari detail 'Nama' jika ada
    const namaRow = editFormData.details.find(d => d.label.toLowerCase().includes('nama'));
    const finalData = {
        ...editFormData,
        fullName: namaRow ? namaRow.value : editFormData.fullName
    };

    if (editingProfileId === 'new') {
        // Add New
        setSavedProfiles(prev => [...prev, finalData]);
    } else {
        // Update Existing
        setSavedProfiles(prev => prev.map(p => p.id === finalData.id ? finalData : p));
    }
    setEditingProfileId(null);
    setEditFormData(null);
  };

  const handleDeleteFromModal = (id: string) => {
      if(!confirm("Hapus profil ini permanen?")) return;
      setSavedProfiles(prev => prev.filter(p => p.id !== id));
      if (editingProfileId === id) handleCancelEdit();
  };

  const updateEditField = (field: 'profileName' | 'fullName', val: string) => {
      setEditFormData(prev => prev ? ({ ...prev, [field]: val }) : null);
  };

  const updateEditDetail = (idx: number, val: string) => {
      setEditFormData(prev => {
          if(!prev) return null;
          const updatedDetails = [...prev.details];
          updatedDetails[idx] = { ...updatedDetails[idx], value: val };
          return { ...prev, details: updatedDetails };
      });
  };

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
              <p className="text-xs text-zinc-500 mb-2">Centang item yang ingin disertakan dalam prompt/surat.</p>
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 group transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                  <input type="checkbox" checked={att.isChecked} onChange={() => onToggleAttachment(att.id)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <input type="text" value={att.text} onChange={(e) => onUpdateAttachment(att.id, e.target.value)} className={`flex-1 bg-transparent text-sm border-none outline-none focus:ring-0 ${!att.isChecked ? 'text-zinc-400 line-through' : 'text-zinc-800 dark:text-zinc-200'}`} placeholder="Nama dokumen..." />
                  <button onClick={() => onDeleteAttachment(att.id)} className="text-zinc-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-2xl space-y-3">
              <button onClick={onAddAttachment} className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-zinc-800 border border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"><Plus size={16} /> Tambah Item Baru</button>
              <Button onClick={() => setIsAttachmentModalOpen(false)} className="w-full justify-center">Selesai</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: KELOLA PROFIL (CRUD) --- */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl h-[500px] rounded-2xl shadow-2xl border dark:border-zinc-800 flex overflow-hidden">
             
             {/* Left Sidebar: List Profiles */}
             <div className="w-1/3 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-800 dark:text-white mb-2">Daftar Orang</h3>
                    <button onClick={handleStartAdd} className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"><Plus size={14}/> Tambah Baru</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {savedProfiles.length === 0 && <p className="text-center text-xs text-zinc-400 mt-4">Belum ada data.</p>}
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
                                <h4 className="font-bold text-sm text-zinc-700 dark:text-zinc-300 mb-2">Detail Data Diri</h4>
                                {editFormData.details.map((detail, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-2">
                                        <div className="col-span-4">
                                             <input type="text" value={detail.label} disabled className="w-full bg-transparent text-[10px] font-bold text-zinc-500 uppercase text-right pr-2" />
                                        </div>
                                        <div className="col-span-8">
                                            <input type="text" value={detail.value} onChange={e => updateEditDetail(idx, e.target.value)} className="w-full p-1.5 text-xs border rounded bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 focus:border-blue-500 outline-none" />
                                        </div>
                                    </div>
                                ))}
                                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-4">Catatan: Mengedit di sini hanya mengubah data yang disimpan, tidak langsung mengubah tampilan surat utama kecuali Anda memilihnya lagi.</p>
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
              {/* Dropdown Select Profile */}
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
                    {attachments.length === 0 && <p className="col-span-2 text-[10px] text-zinc-400 italic text-center">Belum ada lampiran. Klik "Kelola / Edit".</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ... (Job Info & Generate Prompt Cards remain unchanged) ... */}
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
    </>
  );
};